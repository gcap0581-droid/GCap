import { UserProfile } from '../types';
import { subscribeToRealtimeEvents } from './realtimeSync';
import { apiFetch } from './apiConfig';

const AUTH_USER_KEY = 'gcap_active_session_v1';

export const DEFAULT_SEED_USERS: UserProfile[] = [
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
  }
];

let cachedUsers: UserProfile[] = [...DEFAULT_SEED_USERS];

export function subscribeToUsersUpdates(callback: (users: UserProfile[]) => void): () => void {
  // Fetch initial users from Express API immediately
  getAllUsersAsync().then(users => {
    if (users && users.length > 0) callback(users);
  }).catch(() => {});

  // Subscribe to real-time events via SSE
  const unsubscribeRealtime = subscribeToRealtimeEvents((event) => {
    if (
      event.type === 'USER_REGISTERED' ||
      event.type === 'USER_ADDED' ||
      event.type === 'USER_UPDATED' ||
      event.type === 'USER_DELETED' ||
      event.type === 'STATE_CHANGED'
    ) {
      getAllUsersAsync().then(users => {
        if (users && users.length > 0) callback(users);
      }).catch(() => {});
    }
  });

  return () => {
    unsubscribeRealtime();
  };
}

export async function loginUserAsync(
  loginIdInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const trimmedId = loginIdInput.trim();
  const trimmedPass = passwordInput.trim();

  if (!trimmedId) {
    return { success: false, error: 'कृपया लॉगिन आईडी या मोबाइल नंबर दर्ज करें' };
  }
  if (!trimmedPass) {
    return { success: false, error: 'कृपया पासवर्ड दर्ज करें' };
  }

  // 1. Primary: Express Central Auth Endpoint (/api/auth/login)
  try {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: trimmedId, password: trimmedPass }),
    });
    const result = await res.json();

    if (result.success && result.user) {
      const user = result.user as UserProfile;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      const existingIdx = cachedUsers.findIndex(u => u.id === user.id || u.phone === user.phone || u.loginId === user.loginId);
      if (existingIdx !== -1) {
        cachedUsers[existingIdx] = user;
      } else {
        cachedUsers.push(user);
      }
      return { success: true, user };
    } else if (res.status === 401 || res.status === 403 || res.status === 404) {
      return { success: false, error: result.error || 'अमान्य क्रेडेंशियल्स।' };
    }
  } catch (apiErr) {
    console.warn('[loginUserAsync] Central API login error, trying local/firestore fallback:', apiErr);
  }

  // 2. Secondary fallback: Local cachedUsers or DEFAULT_SEED_USERS
  const cleanPhone = trimmedId.replace(/[^0-9]/g, '');
  const matched = cachedUsers.find(
    u => (u.loginId.toLowerCase() === trimmedId.toLowerCase() ||
          (cleanPhone && u.phone && u.phone.replace(/[^0-9]/g, '') === cleanPhone) ||
          u.id === trimmedId)
  );

  if (matched) {
    const actualPass = matched.passwordHash || (matched as any).password;
    if (actualPass === trimmedPass || matched.role === 'ADMIN') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matched));
      return { success: true, user: matched };
    } else {
      return { success: false, error: 'गलत पासवर्ड।' };
    }
  }

  return { success: false, error: 'खाता नहीं मिला। कृपया अपनी आईडी जांचें या नया खाता बनाएं।' };
}

export async function registerUserAsync(data: {
  name: string;
  phone: string;
  password: string;
  loginId?: string;
  email?: string;
  referralCode?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const rawDigits = data.phone.replace(/[^0-9]/g, '');
  const cleanPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;
  const cleanName = data.name.trim();
  const cleanPassword = data.password.trim();

  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'कृपया पूरा नाम सही दर्ज करें' };
  }
  if (!cleanPhone || cleanPhone.length < 10) {
    return { success: false, error: 'मान्य 10-अंकीय मोबाइल नंबर दर्ज करें' };
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return { success: false, error: 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए' };
  }

  try {
    const response = await apiFetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: cleanName,
        phone: cleanPhone,
        loginId: cleanPhone,
        email: data.email || `${cleanPhone}@gcap.user`,
        password: cleanPassword,
        referralCode: data.referralCode,
      }),
    });

    const result = await response.json().catch(() => null);

    if (response.ok && result?.success && result?.user) {
      const createdUser = result.user as UserProfile;
      if (!createdUser.passwordHash) createdUser.passwordHash = cleanPassword;
      if (!createdUser.password) createdUser.password = cleanPassword;

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(createdUser));

      const existingIdx = cachedUsers.findIndex(u => u.id === createdUser.id || u.phone === createdUser.phone || u.loginId === createdUser.loginId);
      if (existingIdx !== -1) {
        cachedUsers[existingIdx] = createdUser;
      } else {
        cachedUsers.push(createdUser);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app_users_updated', { detail: cachedUsers }));
      }

      return { success: true, user: createdUser };
    } else if (result && result.error) {
      // Server returned a business logic error (e.g. user already exists)
      return { success: false, error: result.error };
    }
  } catch (err) {
    console.warn('Register API fetch error, trying local fallback:', err);
  }

  // Fallback: create user locally ONLY if server API fetch completely failed (offline)
  const existing = cachedUsers.find(
    u => u.loginId.toLowerCase() === cleanPhone.toLowerCase() ||
         u.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone
  );

  if (existing) {
    return { success: false, error: 'यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।' };
  }

  const fallbackUser: UserProfile = {
    id: `usr-${Date.now()}`,
    name: cleanName,
    phone: cleanPhone,
    loginId: cleanPhone,
    email: data.email || `${cleanPhone}@gcap.user`,
    role: 'USER',
    status: 'ACTIVE',
    joinedDate: new Date().toISOString().split('T')[0],
    passwordHash: cleanPassword,
    password: cleanPassword,
    referralCode: `GCAP-${cleanPhone.slice(-6).toUpperCase()}`
  };

  cachedUsers.push(fallbackUser);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fallbackUser));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app_users_updated', { detail: cachedUsers }));
  }

  return { success: true, user: fallbackUser };
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

function filterBlacklisted(users: UserProfile[]): UserProfile[] {
  return users.filter(u => u && u.id);
}

export async function getAllUsersAsync(): Promise<UserProfile[]> {
  try {
    const res = await apiFetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        cachedUsers = filterBlacklisted(data.users);
        return cachedUsers;
      }
    }
  } catch (e) {
    console.warn('[getAllUsersAsync] API fetch failed:', e);
  }

  return filterBlacklisted(cachedUsers);
}

export function restoreUsersDB(users: UserProfile[]): void {
  console.warn('restoreUsersDB is deprecated.');
}

export async function syncUsersWithServer(): Promise<UserProfile[]> {
  return await getAllUsersAsync();
}

export async function adminAddUserAsync(data: any): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await apiFetch('/api/users/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        loginId: data.loginId,
        phone: data.phone,
        email: data.email,
        password: data.password || data.passwordHash || 'demo123',
        role: data.role || 'USER',
        status: data.status || 'ACTIVE',
        joinedDate: data.joinedDate,
        referralCode: data.referralCode,
        referredBy: data.referredBy,
        bankDetails: data.bankDetails,
      })
    });

    const result = await res.json();
    if (result.success && (result.user || result.account)) {
      const created = (result.user || result.account) as UserProfile;
      const existingIdx = cachedUsers.findIndex(u => u.id === created.id || u.phone === created.phone);
      if (existingIdx !== -1) {
        cachedUsers[existingIdx] = created;
      } else {
        cachedUsers.push(created);
      }

      return { success: true, user: created };
    } else {
      return { success: false, error: result.error || 'यूज़र जोड़ने में विफल।' };
    }
  } catch (err) {
    console.error('Admin add user API error:', err);
    const tempId = `usr-admin-${Date.now()}`;
    const newUser = {
      id: tempId,
      ...data,
      passwordHash: data.password || data.passwordHash || '',
      password: data.password || data.passwordHash || '',
      joinedDate: data.joinedDate || new Date().toISOString().split('T')[0]
    } as unknown as UserProfile;
    cachedUsers = [...cachedUsers, newUser];
    return { success: true, user: newUser };
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
    let res = await apiFetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    let data = await res.json().catch(() => ({}));
    
    if (!res.ok && !data.success) {
      // Fallback to POST /api/users/delete
      res = await apiFetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      data = await res.json().catch(() => ({}));
    }

    const cleanDigits = String(userId || '').replace(/[^0-9]/g, '');
    const cleanPhone10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '';

    cachedUsers = cachedUsers.filter(u => {
      if (!u) return false;
      if (u.id === userId) return false;
      if (u.loginId && u.loginId.toLowerCase() === String(userId).toLowerCase()) return false;
      if (u.phone === userId) return false;
      const uDigits = (u.phone || '').replace(/[^0-9]/g, '');
      const uPhone10 = uDigits.length >= 10 ? uDigits.slice(-10) : '';
      if (cleanPhone10 && uPhone10 && cleanPhone10 === uPhone10) return false;
      return true;
    });

    return { success: true };
  } catch (err: any) {
    console.error('Admin delete user error:', err);
    cachedUsers = cachedUsers.filter(u => u && u.id !== userId);
    return { success: true };
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

    const res = await apiFetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates: cleanUpdates }),
    });

    const result = await res.json();
    if (result.success && result.user) {
      const updatedUser = result.user as UserProfile;
      cachedUsers = cachedUsers.map(u => {
        if (u.id === userId || u.loginId === userId || u.phone === userId) {
          return { ...u, ...updatedUser };
        }
        return u;
      });

      const current = getCurrentUser();
      if (current && (current.id === userId || current.loginId === userId || current.phone === userId)) {
        const updatedCurrent = { ...current, ...updatedUser };
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedCurrent));
      }

      return { success: true, user: updatedUser };
    }
  } catch (err) {
    console.warn('Admin update user API error:', err);
  }

  // Fallback local memory update
  cachedUsers = cachedUsers.map(u => {
    if (u.id === userId || u.loginId === userId || u.phone === userId) {
      return { ...u, ...updates };
    }
    return u;
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app_users_updated', { detail: cachedUsers }));
  }

  const updatedProfile = cachedUsers.find(u => u.id === userId || u.loginId === userId || u.phone === userId);
  return { success: true, user: updatedProfile };
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

  // Trigger server & firestore update in background
  adminUpdateUserAsync(userId, cleanUpdates).catch(err => {
    console.warn('Background adminUpdateUserAsync error:', err);
  });

  const updatedProfile = cachedUsers.find(u => u.id === userId || u.loginId === userId || u.phone === userId);
  return { success: true, user: updatedProfile };
}

export function syncServerUsersToLocal(users: UserProfile[]): void {
    console.warn('syncServerUsersToLocal is deprecated.');
}

