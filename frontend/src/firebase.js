// ============================================================
//  ScholarAgent — Firebase Configuration
//  File: frontend/src/firebase.js
// ============================================================

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBR4QwAasKwaLTrMnckfT2mJelbpxQubVY",
    authDomain: "algoscholaragent.firebaseapp.com",
    projectId: "algoscholaragent",
    storageBucket: "algoscholaragent.firebasestorage.app",
    messagingSenderId: "256126243350",
    appId: "1:256126243350:web:82752dd7a64b7d8c905b37",
    measurementId: "G-RWFLPNBL40",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
    auth,
    analytics,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    googleProvider,
    signInWithPopup,
    updateProfile,
};
