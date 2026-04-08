// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_70ZSoa_kqHgenXFl6aH6KPWf40qdmMQ",
  authDomain: "ishan-saraswat.firebaseapp.com",
  projectId: "ishan-saraswat",
  storageBucket: "ishan-saraswat.firebasestorage.app",
  messagingSenderId: "316227620939",
  appId: "1:316227620939:web:77cef9f3a72897475d7dce",
  measurementId: "G-JMPFY5RG1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);


const analytics = getAnalytics(app);