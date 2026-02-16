// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqxPmPvDwF2bSaB3W2rN2yPVeO8Dg5hSo",
  authDomain: "health-assistant-9807.firebaseapp.com",
  projectId: "health-assistant-9807",
  storageBucket: "health-assistant-9807.appspot.com",
  messagingSenderId: "976285621510",
  appId: "1:976285621510:web:2dfb474fef67686dbc1287",
  measurementId: "G-MCPG6TP0XG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Guard analytics initialization (may fail in some dev environments)
let analytics = null;
try {
  if (typeof window !== "undefined" && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
} catch (e) {
  // ignore analytics errors in development
}

export const auth = getAuth(app);
