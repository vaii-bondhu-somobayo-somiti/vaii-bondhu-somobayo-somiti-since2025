/**
 * Firebase Client Configuration
 * Uses Vite's import.meta.env for loading secrets from .env securely.
 * Sensitive values (like API Key) are NOT hardcoded here.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_GOOGLE_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "yachty-land-qlcf1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "yachty-land-qlcf1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "yachty-land-qlcf1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1063593032177",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1063593032177:web:9e58856e280783c2d62c50",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-a9d1724b-2b75-49ba-9939-b9ec96e31f54"
};

export default firebaseConfig;
