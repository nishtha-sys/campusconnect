import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCcWBzaRl3KBf4fSFGhsu8p0Pxv_29tifQ",
  authDomain: "campusconnect-72b2d.firebaseapp.com",
  projectId: "campusconnect-72b2d",
  storageBucket: "campusconnect-72b2d.firebasestorage.app",
  messagingSenderId: "299305565267",
  appId: "1:299305565267:web:c0df3b2a38c0cb579e9aa6",
  measurementId: "G-X49TGG74TM"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();






