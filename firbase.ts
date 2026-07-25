// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWw-RioKVOpG4d8kFsOzJ6RieZNTxIiiw",
  authDomain: "tf-org-ltd.firebaseapp.com",
  projectId: "tf-org-ltd",
  storageBucket: "tf-org-ltd.firebasestorage.app",
  messagingSenderId: "1030673729579",
  appId: "1:1030673729579:web:4ddcc54c2ff4b04757426e",
  measurementId: "G-WJNDRRNMNV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);