import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDuAc31A2fOBTizW1_3vVt2CP1uZPnaTDg",
  authDomain: "psikoloji-c629a.firebaseapp.com",
  projectId: "psikoloji-c629a",
  storageBucket: "psikoloji-c629a.firebasestorage.app",
  messagingSenderId: "242175856655",
  appId: "1:242175856655:web:9dc94fb926df514083937a",
  measurementId: "G-09XEMCBG7C"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null; 