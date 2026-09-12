import { UserProfile } from '../types';
import { apiFetch } from './apiConfig';

const AUTH_USER_KEY = 'gcap_active_session_v1';
const USERS_DB_KEY = 'gcap_registered_users_v1';

interface StoredAccount extends UserProfile {
  passwordHash: string;
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 'usr-admin-01',
    loginId: 'Admin',
    name: 'GCap System Admin',
    role: 'ADMIN',
    phone: '+91 98000 12345',
    email: 'admin@gcap.in',
    joinedDate: '2026-01-01',
    status: 'ACTIVE',
    passwordHash: 'gcap@admin1978',
  },
  {
    id: 'usr-user-01',
    loginId: 'Demo',
    name: 'Demo',
    role: 'USER',
    phone: '+91 98765 43210',
    email: 'demo@gcap.in',
    referralCode: 'GCAP-DEMO',
    joinedDate: '2026-08-15',
    status: 'ACTIVE',
    passwordHash: 'demo123',
  }
];

function getAccountsDB(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const accounts: StoredAccount[] = JSON.parse(raw);
    
    let updated = false;

    // Check if Admin exists
    const adminAcc = accounts.find((a) => a.loginId.toLowerCase() === 'admin' || a.role === 'ADMIN');
    if (!adminAcc) {
      accounts.push({
        id: 'usr-admin-01',
        loginId: 'Admin',
        name: 'GCap System Admin',
        role: 'ADMIN',
        phone: '+91 98000 12345',
        email: 'admin@gcap.in',
        joinedDate: '2026-01-01',
        status: 'ACTIVE',
        passwordHash: 'gcap@admin1978',
      });
      updated = true;
    }

    // Check if Demo account exists
    const userAcc = accounts.find(
      (a) => a.loginId.toLowerCase() === 'user' || a.loginId.toLowerCase() === 'demo'
    );
    if (!userAcc) {
      accounts.push({
        id: 'usr-user-01',
        loginId: 'Demo',
        name: 'Demo',
        role: 'USER',
        phone: '+91 98765 43210',
        email: 'demo@gcap.in',
        referralCode: 'GCAP-DEMO',
        joinedDate: '2026-08-15',
        status: 'ACTIVE',
        passwordHash: 'demo123',
      });
      updated = true;
    }

    if (updated) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(accounts));
    }

    return accounts;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

function saveAccountsDB(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(accounts));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gcap_users_updated', { detail: accounts }));
    }
  } catch (err) {
    console.error('Failed to save accounts database:', err);
  }
}

/**
 * Bi-directionally synchronizes users with the central GCap server.
 * Ensures any user created on any mobile phone or browser is immediately
 * uploaded to the central database, and all Admin panels see the exact same users.
 */
export async function syncUsersWithServer(): Promise<UserProfile[]> {
  try {
    // 1. Fetch authoritative master users list from Central Server first (Single Source of Truth)
    const res = await apiFetch('/api/users?t=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        const serverAccounts: StoredAccount[] = data.users;
        try {
          // Preserve local password hashes if server accounts don't have them
          const currentLocal = getAccountsDB();
          const passMap = new Map<string, string>();
          currentLocal.forEach(a => { if (a.passwordHash) passMap.set(a.id, a.passwordHash); });

          const mergedAccounts = serverAccounts.map(sa => ({
            ...sa,
            passwordHash: sa.passwordHash || passMap.get(sa.id) || (sa.role === 'ADMIN' ? 'gcap@admin1978' : 'demo123')
          }));

          localStorage.setItem(USERS_DB_KEY, JSON.stringify(mergedAccounts));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('gcap_users_updated', { detail: mergedAccounts }));
          }
          return mergedAccounts.map(({ passwordHash: _, ...profile }) => profile);
        } catch (e) {
          console.error('Local storage save error:', e);
        }
      }
    }

    // 2. Fallback to /api/users/sync if GET /api/users didn't return
    const localAccounts = getAccountsDB();
    const response = await apiFetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accounts: localAccounts }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.accounts)) {
        const serverAccounts: StoredAccount[] = data.accounts;
        try {
          localStorage.setItem(USERS_DB_KEY, JSON.stringify(serverAccounts));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('gcap_users_updated', { detail: serverAccounts }));
          }
        } catch (e) {
          console.error('Local storage save error:', e);
        }

        return serverAccounts.map(({ passwordHash: _, ...profile }) => profile);
      }
    }
  } catch (err) {
    console.warn('[GCap Sync] Network sync unavailable, using local accounts cache:', err);
  }

  // Return local users if network is offline
  return getAllUsers();
}

/**
 * Subscribes to user updates across browser tabs and server sync events
 */
export function subscribeToUsersUpdates(callback: (users: UserProfile[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const customEvt = e as CustomEvent<StoredAccount[]>;
    if (customEvt.detail && Array.isArray(customEvt.detail)) {
      callback(customEvt.detail.map(({ passwordHash: _, ...p }) => p));
    } else {
      callback(getAllUsers());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === USERS_DB_KEY) {
      callback(getAllUsers());
    }
  };

  window.addEventListener('gcap_users_updated', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('gcap_users_updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

// Auto-sync with server on startup and window focus
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncUsersWithServer();
  }, 1000);

  window.addEventListener('focus', () => {
    syncUsersWithServer();
  });
}

export function restoreUsersDB(users: UserProfile[]): void {
  const currentAccounts = getAccountsDB();
  const passwordMap = new Map<string, string>();
  currentAccounts.forEach((acc) => {
    passwordMap.set(acc.id, acc.passwordHash);
  });

  const updatedAccounts: StoredAccount[] = users.map((u) => ({
    ...u,
    passwordHash: passwordMap.get(u.id) || (u.role === 'ADMIN' ? 'gcap@admin1978' : 'demo123'),
  }));

  saveAccountsDB(updatedAccounts);
}

export function syncServerUsersToLocal(serverUsers: UserProfile[]): void {
  const currentAccounts = getAccountsDB();
  const passwordMap = new Map<string, string>();
  currentAccounts.forEach((acc) => {
    if (acc.passwordHash) {
      passwordMap.set(acc.id, acc.passwordHash);
    }
  });

  const merged: StoredAccount[] = serverUsers.map((u) => ({
    ...u,
    passwordHash: passwordMap.get(u.id) || (u.role === 'ADMIN' ? 'gcap@admin1978' : 'demo123'),
  }));

  saveAccountsDB(merged);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gcap_users_updated', { detail: merged }));
  }
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to update session:', err);
  }
}

/**
 * Central Server-Authoritative Login.
 * Validates against central database so that any password change or new user
 * created on any device immediately works in installed apps.
 */
export async function loginUserAsync(
  loginIdInput: string,
  passwordInput: string,
  expectedRole?: 'ADMIN' | 'USER'
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const trimmedId = loginIdInput.trim().toLowerCase();
  const trimmedPass = passwordInput.trim();

  if (!trimmedId) {
    return { success: false, error: 'कृपया लॉगिन आईडी या मोबाइल नंबर दर्ज करें' };
  }
  if (!trimmedPass) {
    return { success: false, error: 'कृपया पासवर्ड दर्ज करें' };
  }

  // 1. Primary: Verify directly with Central Server (Main DB)
  try {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: trimmedId, password: trimmedPass }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      if (expectedRole && data.user.role !== expectedRole) {
        if (expectedRole === 'ADMIN') {
          return {
            success: false,
            error: 'यह क्रेडेंशियल एडमिन एक्सेस के लिए अधिकृत नहीं है।'
          };
        }
      }

      // Synchronously cache verified account into localStorage
      if (data.account) {
        const accounts = getAccountsDB();
        const existingIdx = accounts.findIndex((a) => a.id === data.account.id);
        if (existingIdx !== -1) {
          accounts[existingIdx] = data.account;
        } else {
          accounts.push(data.account);
        }
        saveAccountsDB(accounts);
      }

      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } else if (res.status === 401 || res.status === 404 || res.status === 403) {
      // Direct rejection from server: wrong password or user not found
      return { success: false, error: data.error || 'लॉगिन विफल रहा' };
    }
  } catch (netErr) {
    console.warn('Central server login unreachable, falling back to local storage:', netErr);
  }

  // 2. Offline fallback to local accounts if server is unreachable
  return loginUser(loginIdInput, passwordInput, expectedRole);
}

export function loginUser(
  loginIdInput: string,
  passwordInput: string,
  expectedRole?: 'ADMIN' | 'USER'
): { success: boolean; user?: UserProfile; error?: string } {
  const trimmedId = loginIdInput.trim().toLowerCase();
  const trimmedPass = passwordInput.trim();

  if (!trimmedId) {
    return { success: false, error: 'कृपया लॉगिन आईडी या मोबाइल नंबर दर्ज करें' };
  }
  if (!trimmedPass) {
    return { success: false, error: 'कृपया पासवर्ड दर्ज करें' };
  }

  const accounts = getAccountsDB();
  const account = accounts.find(
    (acc) =>
      acc.loginId.toLowerCase() === trimmedId ||
      (acc.email && acc.email.toLowerCase() === trimmedId) ||
      acc.phone.replace(/[^0-9]/g, '') === trimmedId.replace(/[^0-9]/g, '')
  );

  if (!account) {
    return {
      success: false,
      error: 'खाता नहीं मिला। कृपया अपनी आईडी जांचें या नया खाता बनाएं।'
    };
  }

  const isAdmin =
    account.role === 'ADMIN' ||
    account.loginId.toLowerCase() === 'admin' ||
    trimmedId === 'admin';

  if (isAdmin) {
    // Only allow the new secure admin password
    if (trimmedPass === 'gcap@admin1978' || account.passwordHash === trimmedPass) {
      if (account.passwordHash !== 'gcap@admin1978' && trimmedPass === 'gcap@admin1978') {
        account.passwordHash = 'gcap@admin1978';
        saveAccountsDB(accounts);
      }
    } else {
      return {
        success: false,
        error: 'गलत पासवर्ड। कृपया सही एडमिन पासवर्ड दर्ज करें।'
      };
    }
  } else {
    if (account.passwordHash !== trimmedPass) {
      return {
        success: false,
        error: 'गलत पासवर्ड। कृपया पुनः प्रयास करें।'
      };
    }
  }

  if (account.status === 'BLOCKED') {
    return {
      success: false,
      error: 'यह खाता निलंबित (Blocked) है। कृपया एडमिन सहायता से संपर्क करें।'
    };
  }

  if (expectedRole && account.role !== expectedRole) {
    if (expectedRole === 'ADMIN') {
      return {
        success: false,
        error: 'यह क्रेडेंशियल एडमिन एक्सेस के लिए अधिकृत नहीं है।'
      };
    }
  }

  // Profile without passwordHash
  const { passwordHash, ...profile } = account;
  setCurrentUser(profile);
  return { success: true, user: profile };
}

/**
 * Server-Authoritative Registration.
 * Immediately registers on the Central DB so Admin and all panels see the new user right away.
 */
export async function registerUserAsync(data: {
  name: string;
  loginId?: string;
  phone: string;
  email?: string;
  password: string;
  referralCode?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const name = data.name.trim();
  const phone = data.phone.trim().replace(/[^0-9]/g, '');
  const loginId = (data.loginId?.trim() || phone).toLowerCase();
  const password = data.password.trim();

  if (!name || name.length < 2) {
    return { success: false, error: 'कृपया पूरा नाम सही दर्ज करें' };
  }
  if (!phone || phone.length < 10) {
    return { success: false, error: 'मान्य 10-अंकीय मोबाइल नंबर दर्ज करें' };
  }
  if (!password || password.length < 4) {
    return { success: false, error: 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए' };
  }

  // 1. Register directly on central server
  try {
    const res = await apiFetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        loginId,
        phone: data.phone.trim(),
        email: data.email?.trim() || `${phone}@gcap.user`,
        password,
        referralCode: data.referralCode?.trim().toUpperCase(),
      }),
    });

    const serverData = await res.json();
    if (res.ok && serverData.success && serverData.user) {
      // Save account locally
      const accounts = getAccountsDB();
      const newAcc: StoredAccount = serverData.account || {
        ...serverData.user,
        passwordHash: password,
      };
      const existingIdx = accounts.findIndex((a) => a.id === newAcc.id || a.phone === newAcc.phone);
      if (existingIdx !== -1) {
        accounts[existingIdx] = newAcc;
      } else {
        accounts.push(newAcc);
      }
      saveAccountsDB(accounts);
      setCurrentUser(serverData.user);

      // Broadcast user update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gcap_users_updated', { detail: accounts }));
      }

      return { success: true, user: serverData.user };
    } else if (serverData.error) {
      return { success: false, error: serverData.error };
    }
  } catch (netErr) {
    console.warn('Central server register failed, falling back to local storage:', netErr);
  }

  // 2. Offline fallback
  return registerUser(data);
}

export function registerUser(data: {
  name: string;
  loginId?: string;
  phone: string;
  email?: string;
  password: string;
  referralCode?: string;
}): { success: boolean; user?: UserProfile; error?: string } {
  const name = data.name.trim();
  const phone = data.phone.trim().replace(/[^0-9]/g, '');
  const loginId = (data.loginId?.trim() || phone).toLowerCase();
  const password = data.password.trim();

  if (!name || name.length < 2) {
    return { success: false, error: 'कृपया पूरा नाम सही दर्ज करें' };
  }
  if (!phone || phone.length < 10) {
    return { success: false, error: 'मान्य 10-अंकीय मोबाइल नंबर दर्ज करें' };
  }
  if (!password || password.length < 4) {
    return { success: false, error: 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए' };
  }

  const accounts = getAccountsDB();
  const existing = accounts.find(
    (acc) =>
      acc.loginId.toLowerCase() === loginId ||
      acc.phone.replace(/[^0-9]/g, '') === phone
  );

  if (existing) {
    return {
      success: false,
      error: 'यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।'
    };
  }

  const newAccount: StoredAccount = {
    id: `usr-${Date.now()}`,
    loginId,
    name,
    role: 'USER',
    phone: data.phone.trim(),
    email: data.email?.trim() || `${phone}@gcap.user`,
    referralCode: `GCAP-${phone.slice(-6).toUpperCase()}`,
    referredBy: data.referralCode?.trim().toUpperCase(),
    joinedDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    passwordHash: password,
  };

  accounts.push(newAccount);
  saveAccountsDB(accounts);

  // Sync with central server so Admin sees this user from any device
  apiFetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch((e) => console.warn('Background server register sync:', e));

  const { passwordHash: _, ...profile } = newAccount;
  setCurrentUser(profile);
  return { success: true, user: profile };
}

export function getAllUsers(): UserProfile[] {
  const accounts = getAccountsDB();
  return accounts.map(({ passwordHash, ...profile }) => profile);
}

export function adminAddUser(data: {
  name: string;
  loginId: string;
  phone: string;
  email?: string;
  password?: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'BLOCKED';
  joinedDate?: string;
}): { success: boolean; user?: UserProfile; error?: string } {
  const name = data.name.trim();
  const loginId = data.loginId.trim().toLowerCase();
  const phone = data.phone.trim();
  const password = (data.password || 'demo123').trim();

  if (!name || name.length < 2) {
    return { success: false, error: 'कृपया पूरा नाम दर्ज करें' };
  }
  if (!loginId || loginId.length < 3) {
    return { success: false, error: 'लॉगिन आईडी कम से कम 3 अक्षरों की होनी चाहिए' };
  }
  if (!phone) {
    return { success: false, error: 'कृपया फ़ोन नंबर दर्ज करें' };
  }

  const accounts = getAccountsDB();
  const existing = accounts.find(
    (acc) =>
      acc.loginId.toLowerCase() === loginId ||
      acc.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, '')
  );

  if (existing) {
    return {
      success: false,
      error: 'यह लॉगिन आईडी या फ़ोन नंबर पहले से मौजूद है।'
    };
  }

  const newAccount: StoredAccount = {
    id: `usr-${Date.now()}`,
    loginId,
    name,
    role: data.role,
    phone,
    email: data.email?.trim() || `${loginId}@gcap.in`,
    referralCode: `GCAP-${loginId.toUpperCase()}`,
    joinedDate: data.joinedDate?.trim() || new Date().toISOString().split('T')[0],
    status: data.status,
    passwordHash: password,
  };

  accounts.push(newAccount);
  saveAccountsDB(accounts);

  // Sync to central server
  apiFetch('/api/users/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch((e) => console.warn('Background server user add sync:', e));

  const { passwordHash: _, ...profile } = newAccount;
  return { success: true, user: profile };
}

export async function adminAddUserAsync(data: {
  name: string;
  loginId: string;
  phone: string;
  email?: string;
  password?: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'BLOCKED';
  joinedDate?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await apiFetch('/api/users/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok && result.success && result.user) {
      await syncUsersWithServer();
      return { success: true, user: result.user };
    } else if (result.error) {
      return { success: false, error: result.error };
    }
  } catch (err) {
    console.warn('Server user add error, saving locally:', err);
  }
  return adminAddUser(data);
}

export function adminUpdateUser(
  userId: string,
  updates: {
    name?: string;
    phone?: string;
    email?: string;
    role?: 'ADMIN' | 'USER';
    status?: 'ACTIVE' | 'BLOCKED';
    password?: string;
    joinedDate?: string;
  }
): { success: boolean; user?: UserProfile; error?: string } {
  const accounts = getAccountsDB();
  const index = accounts.findIndex((a) => a.id === userId);
  if (index === -1) {
    return { success: false, error: 'यूज़र नहीं मिला' };
  }

  const acc = accounts[index];
  if (updates.name) acc.name = updates.name.trim();
  if (updates.phone) acc.phone = updates.phone.trim();
  if (updates.email) acc.email = updates.email.trim();
  if (updates.role) acc.role = updates.role;
  if (updates.status) acc.status = updates.status;
  if (updates.joinedDate) acc.joinedDate = updates.joinedDate.trim();
  if (updates.password && updates.password.trim()) {
    acc.passwordHash = updates.password.trim();
  }

  accounts[index] = acc;
  saveAccountsDB(accounts);

  // Sync to central server
  apiFetch('/api/users/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, updates }),
  }).catch((e) => console.warn('Background server user update sync:', e));

  const { passwordHash: _, ...profile } = acc;
  return { success: true, user: profile };
}

export async function adminUpdateUserAsync(
  userId: string,
  updates: {
    name?: string;
    phone?: string;
    email?: string;
    role?: 'ADMIN' | 'USER';
    status?: 'ACTIVE' | 'BLOCKED';
    password?: string;
    joinedDate?: string;
  }
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await apiFetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates }),
    });
    const result = await res.json();
    if (res.ok && result.success && result.user) {
      await syncUsersWithServer();
      return { success: true, user: result.user };
    } else if (result.error) {
      return { success: false, error: result.error };
    }
  } catch (err) {
    console.warn('Server user update error, updating locally:', err);
  }
  return adminUpdateUser(userId, updates);
}

export function adminDeleteUser(userId: string): { success: boolean; error?: string } {
  const accounts = getAccountsDB();
  const target = accounts.find((a) => a.id === userId);
  if (!target) {
    return { success: false, error: 'यूज़र नहीं मिला' };
  }
  if (target.loginId.toLowerCase() === 'admin' || target.role === 'ADMIN') {
    return { success: false, error: 'सुरक्षा कारणों से मुख्य सुपर एडमिन को हटाया नहीं जा सकता।' };
  }

  const filtered = accounts.filter((a) => a.id !== userId);
  saveAccountsDB(filtered);

  // Sync to central server
  apiFetch(`/api/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  }).catch((e) => console.warn('Background server user delete sync:', e));

  return { success: true };
}

export async function adminDeleteUserAsync(userId: string): Promise<{ success: boolean; error?: string }> {
  // 1. Immediately delete locally to provide instant UI feedback
  const accounts = getAccountsDB();
  const target = accounts.find((a) => a.id === userId);
  if (target && (target.loginId.toLowerCase() === 'admin' || target.role === 'ADMIN')) {
    return { success: false, error: 'सुरक्षा कारणों से मुख्य सुपर एडमिन को हटाया नहीं जा सकता।' };
  }

  const filtered = accounts.filter((a) => a.id !== userId);
  saveAccountsDB(filtered);

  // 2. Delete on central server
  try {
    const res = await apiFetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    const result = await res.json();
    if (res.ok && result.success) {
      await syncUsersWithServer();
      return { success: true };
    } else if (result.error) {
      return { success: false, error: result.error };
    }
  } catch (err) {
    console.warn('Server delete user error, deleted locally:', err);
  }
  return { success: true };
}

export function logoutUser(): void {
  setCurrentUser(null);
}
