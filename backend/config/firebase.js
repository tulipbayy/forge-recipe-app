// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDh0Da440PvMPZTCIU7NfxuWdQ41rBUzwM",
  authDomain: "forge-recipe-app.firebaseapp.com",
  projectId: "forge-recipe-app",
  storageBucket: "forge-recipe-app.firebasestorage.app",
  messagingSenderId: "790550250356",
  appId: "1:790550250356:web:60dd1202d75df6ceaee221",
  measurementId: "G-RQMXBT0LHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);