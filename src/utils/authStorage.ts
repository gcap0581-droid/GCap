import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const AUTH_USER_KEY = 'gcap_active_session_v1';

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
