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
  apiKey: "AIzaSyBz_CKaiACtXaNOxBLGvGwKCNzupT8Ubzc",
  authDomain: "shieldchat-app.firebaseapp.com",
  projectId: "shieldchat-app",
  storageBucket: "shieldchat-app.firebasestorage.app",
  messagingSenderId: "789251817889",
  appId: "1:789251817889:web:c1f00995596749d8908be0",
  measurementId: "G-3HGGNC95YG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);


const analytics = getAnalytics(app);