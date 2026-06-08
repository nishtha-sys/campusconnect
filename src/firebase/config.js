import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// These are public client-side keys — safe to commit
// For extra security you can move these to VITE_ env vars
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCcWBzaRl3KBf4fSFGhsu8p0Pxv_29tifQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'campusconnect-72b2d.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'campusconnect-72b2d',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'campusconnect-72b2d.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '299305565267',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:299305565267:web:c0df3b2a38c0cb579e9aa6',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
