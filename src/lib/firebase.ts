import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCPC8BiUQGE-rMYSe6icy8F9UBt7mp_uaQ",
  authDomain: "gen-lang-client-0701775599.firebaseapp.com",
  projectId: "gen-lang-client-0701775599",
  storageBucket: "gen-lang-client-0701775599.firebasestorage.app",
  messagingSenderId: "860344681027",
  appId: "1:860344681027:web:0ed1d7850cc0bdf53f4af6"
};

const DB_ID = "ai-studio-gcap-978eb8da-bbb3-4e61-9f93-28b174b28c91";

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  try {
    if (!cachedApp) {
      cachedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      console.log('[Firebase] App initialized successfully');
    }
    return cachedApp;
  } catch (err) {
    console.error('[Firebase] App initialization error:', err);
    return null;
  }
}

export function getFirestoreDb(): Firestore | null {
  if (cachedDb) return cachedDb;
  try {
    const app = getFirebaseApp();
    if (!app) return null;
    
    cachedDb = getFirestore(app, DB_ID);
    console.log('[Firebase] Firestore initialized with DB:', DB_ID);
    return cachedDb;
  } catch (err) {
    console.error('[Firebase] Firestore initialization error:', err);
    return null;
  }
}

// Backwards compatibility getter - evaluates lazily on property access, NEVER crashes on import
export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    const instance = getFirestoreDb();
    if (!instance) {
      console.error('[Firebase] Accessing DB instance that failed to initialize');
      return undefined;
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});
