import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';

const AUTH_USER_KEY = 'gcap_active_session_v1';

const DEFAULT_SEED_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    loginId: 'admin',
    name: 'GCap System Admin',
    role: 'ADMIN',
    phone: '9800012345',
    email: 'admin@gcap.in',
    joinedDate: '2026-01-01',
    status: 'ACTIVE',
    passwordHash: 'gcap@admin1978'
  },
  {
    id: 'usr-user-01',
    loginId: 'demo',
    name: 'Demo User',
    role: 'USER',
    phone: '9876543210',
    email: 'demo@gcap.in',
    referralCode: 'GCAP-DEMO',
    joinedDate: '2026-08-15',
    status: 'ACTIVE',
    passwordHash: 'demo123'
  }
];

let isSeeding = false;
async function ensureInitialUsersExist(): Promise<void> {
  if (isSeeding) return;
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    if (snapshot.empty) {
      isSeeding = true;
      for (const u of DEFAULT_SEED_USERS) {
        await addDoc(usersRef, u);
      }
      console.log('Default Firestore users seeded successfully.');
    }
  } catch (err) {
    console.warn('Could not auto-seed users:', err);
  } finally {
    isSeeding = false;
  }
}

let cachedUsers: UserProfile[] = [...DEFAULT_SEED_USERS];

export function subscribeToUsersUpdates(callback: (users: UserProfile[]) => void): () => void {
  ensureInitialUsersExist();
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, (snapshot) => {
    if (snapshot.empty) {
      cachedUsers = [...DEFAULT_SEED_USERS];
      callback(cachedUsers);
    } else {
      const users = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          passwordHash: data.passwordHash || data.password || '',
          password: data.passwordHash || data.password || ''
        } as unknown as UserProfile;
      });
      cachedUsers = users;
      callback(users);
    }
  });
}

export async function loginUserAsync(
  loginIdInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const trimmedId = loginIdInput.trim();
  const trimmedPass = passwordInput.trim();

  try {
    await ensureInitialUsersExist();
    const usersRef = collection(db, 'users');
    const allSnapshot = await getDocs(usersRef);
    
    let userDoc = null;
    let userData: any = null;

    if (!allSnapshot.empty) {
      const cleanPhone = trimmedId.replace(/[^0-9]/g, '');
      const matched = allSnapshot.docs.find(d => {
        const data = d.data();
        const phoneMatch = cleanPhone && data.phone && data.phone.replace(/[^0-9]/g, '') === cleanPhone;
        const loginMatch = data.loginId && data.loginId.toLowerCase() === trimmedId.toLowerCase();
        const nameMatch = data.name && data.name.toLowerCase() === trimmedId.toLowerCase();
        const idMatch = data.id && data.id === trimmedId;
        return phoneMatch || loginMatch || nameMatch || idMatch;
      });

      if (matched) {
        userDoc = matched;
        userData = matched.data();
      }
    }

    // Check cached users if not found in snapshot
    if (!userData) {
      const cached = cachedUsers.find(
        u => (u.loginId.toLowerCase() === trimmedId.toLowerCase() ||
              u.phone.replace(/[^0-9]/g, '') === trimmedId.replace(/[^0-9]/g, '') ||
              u.id === trimmedId)
      );
      if (cached) {
        userData = cached;
      }
    }

    if (!userData) {
      // Check hardcoded seed users
      const seedMatch = DEFAULT_SEED_USERS.find(
        u => (u.loginId.toLowerCase() === trimmedId.toLowerCase() || 
              u.phone === trimmedId.replace(/[^0-9]/g, ''))
      );
      if (seedMatch) {
        userData = seedMatch;
        addDoc(usersRef, seedMatch).catch(() => {});
      }
    }

    if (!userData) {
      return { success: false, error: 'खाता नहीं मिला। कृपया अपनी आईडी जांचें या नया खाता बनाएं।' };
    }

    const actualPassword = userData.passwordHash || userData.password;
    if (actualPassword !== trimmedPass) {
      return { success: false, error: 'गलत पासवर्ड।' };
    }

    const profile = { 
      id: userDoc ? userDoc.id : userData.id, 
      ...userData,
      passwordHash: actualPassword,
      password: actualPassword
    } as UserProfile;

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
    return { success: true, user: profile };
  } catch (err) {
    console.error('Login error:', err);
    // Fallback on cached/seed users
    const fallback = cachedUsers.find(
      u => (u.loginId.toLowerCase() === trimmedId.toLowerCase() ||
            u.phone.replace(/[^0-9]/g, '') === trimmedId.replace(/[^0-9]/g, '')) &&
           (u.passwordHash === trimmedPass || (u as any).password === trimmedPass)
    );
    if (fallback) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fallback));
      return { success: true, user: fallback };
    }
    return { success: false, error: 'सर्वर त्रुटि, कृपया पुनः प्रयास करें।' };
  }
}

export async function registerUserAsync(data: {
  name: string;
  phone: string;
  password: string;
  loginId?: string;
  email?: string;
  referralCode?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanPhone = data.phone.replace(/[^0-9]/g, '');
  
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', cleanPhone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        return { success: false, error: 'यह मोबाइल नंबर पहले से पंजीकृत है।' };
    }

    const newUser = {
        name: data.name,
        phone: cleanPhone,
        loginId: data.loginId ? data.loginId.trim() : cleanPhone,
        email: data.email || '',
        referralCode: data.referralCode || '',
        passwordHash: data.password,
        password: data.password,
        role: 'USER' as const,
        status: 'ACTIVE' as const,
        joinedDate: new Date().toISOString().split('T')[0]
    };
    
    const docRef = await addDoc(usersRef, newUser);
    const profile = { id: docRef.id, ...newUser } as unknown as UserProfile;
    
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
    return { success: true, user: profile };
  } catch (err) {
    console.error('Register error:', err);
    return { success: false, error: 'पंजीकरण विफल रहा।' };
  }
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAllUsers(): UserProfile[] {
  return cachedUsers;
}

export async function getAllUsersAsync(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    if (!snapshot.empty) {
      cachedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
    }
    return cachedUsers;
  } catch (err) {
    console.error('Failed to fetch all users:', err);
    return cachedUsers;
  }
}

export function restoreUsersDB(users: UserProfile[]): void {
  // Firestore-based apps do not need local restore. 
  // No-op or log warning if called.
  console.warn('restoreUsersDB is deprecated in Firestore mode.');
}

export async function syncUsersWithServer(): Promise<UserProfile[]> {
  console.warn('syncUsersWithServer is deprecated in Firestore mode.');
  return await getAllUsers();
}

export async function adminAddUserAsync(data: any): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const usersRef = collection(db, 'users');
    const newUser = { 
      ...data, 
      passwordHash: data.password || data.passwordHash || '',
      password: data.password || data.passwordHash || '',
      joinedDate: data.joinedDate || new Date().toISOString().split('T')[0] 
    };
    const docRef = await addDoc(usersRef, newUser);
    const created = { id: docRef.id, ...newUser } as unknown as UserProfile;
    cachedUsers = [...cachedUsers, created];
    return { success: true, user: created };
  } catch (err) {
    console.error('Admin add user error:', err);
    return { success: false, error: 'यूज़र जोड़ने में विफल।' };
  }
}

export function adminAddUser(data: any): { success: boolean; user?: UserProfile; error?: string } {
  const tempId = `usr-admin-${Date.now()}`;
  const newUser = {
    id: tempId,
    ...data,
    passwordHash: data.password || data.passwordHash || '',
    password: data.password || data.passwordHash || '',
    joinedDate: data.joinedDate || new Date().toISOString().split('T')[0]
  } as unknown as UserProfile;
  cachedUsers = [...cachedUsers, newUser];
  adminAddUserAsync(data).catch(e => console.warn('Background adminAddUser error:', e));
  return { success: true, user: newUser };
}

export async function adminDeleteUserAsync(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, 'users', userId));
    cachedUsers = cachedUsers.filter(u => u.id !== userId);
    return { success: true };
  } catch (err) {
    console.error('Admin delete user error:', err);
    return { success: false, error: 'यूज़र हटाने में विफल।' };
  }
}

export function adminDeleteUser(userId: string): { success: boolean; error?: string } {
  cachedUsers = cachedUsers.filter(u => u.id !== userId);
  adminDeleteUserAsync(userId).catch(e => console.warn('Background adminDeleteUser error:', e));
  return { success: true };
}

export async function adminUpdateUserAsync(userId: string, updates: any): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const cleanUpdates = { ...updates };
    if (cleanUpdates.password && !cleanUpdates.passwordHash) {
      cleanUpdates.passwordHash = cleanUpdates.password;
    }
    if (cleanUpdates.passwordHash && !cleanUpdates.password) {
      cleanUpdates.password = cleanUpdates.passwordHash;
    }

    const usersRef = collection(db, 'users');
    let docIdToUpdate = userId;
    let foundDoc = false;

    // Check if doc exists with this exact doc ID
    try {
      const directRef = doc(db, 'users', userId);
      await updateDoc(directRef, cleanUpdates);
      foundDoc = true;
    } catch {
      // If direct update failed, query by id / loginId / phone
      const qSnap = await getDocs(usersRef);
      const matched = qSnap.docs.find(d => {
        const data = d.data();
        return d.id === userId || data.id === userId || data.loginId === userId || data.phone === userId;
      });

      if (matched) {
        docIdToUpdate = matched.id;
        await updateDoc(doc(db, 'users', docIdToUpdate), cleanUpdates);
        foundDoc = true;
      } else {
        // If not in firestore yet, add it
        const newDoc = { id: userId, ...cleanUpdates };
        await addDoc(usersRef, newDoc);
        foundDoc = true;
      }
    }

    // Update in-memory cache
    cachedUsers = cachedUsers.map(u => {
      if (u.id === userId || u.loginId === userId || u.phone === userId) {
        return { ...u, ...cleanUpdates };
      }
      return u;
    });

    // Update current active user if it matches
    const current = getCurrentUser();
    if (current && (current.id === userId || current.loginId === userId || current.phone === userId)) {
      const updatedCurrent = { ...current, ...cleanUpdates };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedCurrent));
    }

    const updatedProfile = cachedUsers.find(u => u.id === userId || u.loginId === userId || u.phone === userId);
    return { success: true, user: updatedProfile };
  } catch (err) {
    console.error('Admin update user error:', err);
    return { success: false, error: 'यूज़र अपडेट करने में विफल।' };
  }
}

export function adminUpdateUser(userId: string, updates: any): { success: boolean; user?: UserProfile; error?: string } {
  const cleanUpdates = { ...updates };
  if (cleanUpdates.password && !cleanUpdates.passwordHash) {
    cleanUpdates.passwordHash = cleanUpdates.password;
  }
  if (cleanUpdates.passwordHash && !cleanUpdates.password) {
    cleanUpdates.password = cleanUpdates.passwordHash;
  }

  // Update in-memory cache immediately
  cachedUsers = cachedUsers.map(u => {
    if (u.id === userId || u.loginId === userId || u.phone === userId) {
      return { ...u, ...cleanUpdates };
    }
    return u;
  });

  const current = getCurrentUser();
  if (current && (current.id === userId || current.loginId === userId || current.phone === userId)) {
    const updatedCurrent = { ...current, ...cleanUpdates };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedCurrent));
  }

  // Trigger firestore update in background
  adminUpdateUserAsync(userId, cleanUpdates).catch(err => {
    console.warn('Background adminUpdateUserAsync error:', err);
  });

  const updatedProfile = cachedUsers.find(u => u.id === userId || u.loginId === userId || u.phone === userId);
  return { success: true, user: updatedProfile };
}

export function syncServerUsersToLocal(users: UserProfile[]): void {
    console.warn('syncServerUsersToLocal is deprecated in Firestore mode.');
}

