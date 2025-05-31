// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: "abc-folio",
  storageBucket: "abc-folio.firebasestorage.app",
  messagingSenderId: "493686804138",
  appId: "1:493686804138:web:1c5f418cae4e89d9440ad3",
  measurementId: "G-E6V03VSQ10",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

export enum FirebaseCollection {
  articles = "articles-blog",
  dailyTasks = "daily-tasks",
  templateTasks = "template-tasks",
  plannedTasks = "planned-tasks",
}

export const FirebaseCollectionProps = {
  [FirebaseCollection.dailyTasks]: {
    days: "days",
  },
  [FirebaseCollection.plannedTasks]: {
    days: "days",
  },
};
