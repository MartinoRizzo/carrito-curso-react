import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB0c2AKEOYbW-6YAWUieOtG-m-JFEU7CLI",
  authDomain: "possible-droplet-sfs6l.firebaseapp.com",
  projectId: "possible-droplet-sfs6l",
  storageBucket: "possible-droplet-sfs6l.firebasestorage.app",
  messagingSenderId: "306422696659",
  appId: "1:306422696659:web:45d1fd60699c45621be226"
};

const app = initializeApp(firebaseConfig);

// Use explicit database ID from firebase-applet-config.json
export const db = getFirestore(app, "ai-studio-2cd6422e-8b0a-4c23-b389-24c11a5cd496");
export const auth = getAuth(app);
export default app;
