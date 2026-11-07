/**
 * Firebase Integration Module for RGCITC
 * Gracefully bridges Firebase Cloud Firestore & Auth when configured,
 * with seamless fallback to localStorage for offline testing and demo mode.
 */

// Replace these placeholder values with your Firebase Project Config
// (Found under Firebase Console -> Project Settings -> General -> Your Apps)
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "rgcitc.firebaseapp.com",
  projectId: "rgcitc",
  storageBucket: "rgcitc.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const isFirebaseConfigured = () => {
  return FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY" && typeof firebase !== 'undefined';
};

// Initialize Firebase if loaded and configured
if (typeof firebase !== 'undefined' && isFirebaseConfigured()) {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
  } catch (e) {
    console.warn("Firebase initialization skipped or already initialized:", e);
  }
}
