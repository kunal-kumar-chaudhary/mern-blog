// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-d58c6.firebaseapp.com",
  projectId: "mern-blog-d58c6",
  storageBucket: "mern-blog-d58c6.appspot.com",
  messagingSenderId: "87314802358",
  appId: "1:87314802358:web:6a0af61ece4193193a2817"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);