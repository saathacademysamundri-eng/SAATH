

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-5400175364-fe933",
  appId: "1:225701234398:web:606fa4acb720e2a9a1644f",
  apiKey: "AIzaSyCX660SXd0eoxCugs7zdggQ0f9gCooFvdo",
  authDomain: "studio-5400175364-fe933.firebaseapp.com",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// In development, connect to the emulators
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(db, 'localhost', 8080);
}


export { app, auth, db };
