// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWvHe5z-ttoeZu_KXVcJMU7ZB-YIiqPEI",
  authDomain: "navkar-academy.firebaseapp.com",
  projectId: "navkar-academy",
  storageBucket: "navkar-academy.appspot.com",
  messagingSenderId: "782515928134",
  appId: "1:782515928134:web:de951a73fc49122c211e47",
  measurementId: "G-6BW8K994T5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const database = getFirestore(app);

export {auth, db, database}