import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';

const AUTH_USER_KEY = 'gcap_active_session_v1';

export function subscribeToUsersUpdates(callback: (users: UserProfile[]) => void): () => void {
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
    callback(users);
  });
}

export async function loginUserAsync(
  loginIdInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const trimmedId = loginIdInput.trim();
  const trimmedPass = passwordInput.trim();

  try {
    const usersRef = collection(db, 'users');
    const cleanId = trimmedId.replace(/[^0-9]/g, '');
    const q = query(usersRef, where('phone', '==', cleanId));
    const querySnapshot = await getDocs(q);

    let userDoc = null;
    let userData = null;

    if (!querySnapshot.empty) {
      userDoc = querySnapshot.docs[0];
      userData = userDoc.data();
    } else {
        const q2 = query(usersRef, where('loginId', '==', trimmedId.toLowerCase()));
        const snapshot2 = await getDocs(q2);
        if (!snapshot2.empty) {
            userDoc = snapshot2.docs[0];
            userData = userDoc.data();
        }
    }

    if (!userData) {
      return { success: false, error: 'खाता नहीं मिला। कृपया अपनी आईडी जांचें या नया खाता बनाएं।' };
    }

    if (userData.passwordHash !== trimmedPass) {
      return { success: false, error: 'गलत पासवर्ड।' };
    }

    const profile = { id: userDoc!.id, ...userData } as UserProfile;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
    return { success: true, user: profile };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: 'सर्वर त्रुटि, कृपया पुनः प्रयास करें।' };
  }
}

export async function registerUserAsync(data: {
  name: string;
  phone: string;
  password: string;
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
        loginId: cleanPhone,
        passwordHash: data.password,
        role: 'USER',
        status: 'ACTIVE',
        joinedDate: new Date().toISOString().split('T')[0]
    };
    
    const docRef = await addDoc(usersRef, newUser);
    const profile = { id: docRef.id, ...newUser } as UserProfile;
    
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

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
  } catch (err) {
    console.error('Failed to fetch all users:', err);
    return [];
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
    const newUser = { ...data, joinedDate: data.joinedDate || new Date().toISOString().split('T')[0] };
    const docRef = await addDoc(usersRef, newUser);
    return { success: true, user: { id: docRef.id, ...newUser } as UserProfile };
  } catch (err) {
    console.error('Admin add user error:', err);
    return { success: false, error: 'यूज़र जोड़ने में विफल।' };
  }
}

export async function adminDeleteUserAsync(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return { success: true };
  } catch (err) {
    console.error('Admin delete user error:', err);
    return { success: false, error: 'यूज़र हटाने में विफल।' };
  }
}

export async function adminUpdateUserAsync(userId: string, updates: any): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
    return { success: true };
  } catch (err) {
    console.error('Admin update user error:', err);
    return { success: false, error: 'यूज़र अपडेट करने में विफल।' };
  }
}

export function adminUpdateUser(userId: string, updates: any): { success: boolean; error?: string } {
    console.warn('adminUpdateUser is deprecated, please use adminUpdateUserAsync');
    return { success: true };
}

export function syncServerUsersToLocal(users: UserProfile[]): void {
    console.warn('syncServerUsersToLocal is deprecated in Firestore mode.');
}

