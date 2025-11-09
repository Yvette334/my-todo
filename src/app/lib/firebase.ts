// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDQRmRitgQfFiw_mnXnsuXNuJbJeQiEPw",
  authDomain: "todo-b7941.firebaseapp.com",
  projectId: "todo-b7941",
  storageBucket: "todo-b7941.firebasestorage.app",
  messagingSenderId: "635810582703",
  appId: "1:635810582703:web:2a120af316cbba5709c45a",
  measurementId: "G-ZJ87QEGJLR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);