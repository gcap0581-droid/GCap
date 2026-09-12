import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCPC8BiUQGE-rMYSe6icy8F9UBt7mp_uaQ",
  authDomain: "gen-lang-client-0701775599.firebaseapp.com",
  projectId: "gen-lang-client-0701775599",
  storageBucket: "gen-lang-client-0701775599.firebasestorage.app",
  messagingSenderId: "860344681027",
  appId: "1:860344681027:web:0ed1d7850cc0bdf53f4af6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-gcap-978eb8da-bbb3-4e61-9f93-28b174b28c91");
