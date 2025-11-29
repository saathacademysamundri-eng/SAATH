
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

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

// Enable offline persistence
if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db)
      .then(() => console.log("Firestore persistence enabled."))
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          console.warn("Firestore persistence failed: Multiple tabs open. Persistence can only be enabled in one tab at a time.");
        } else if (err.code == 'unimplemented') {
          console.warn("Firestore persistence failed: The current browser does not support all of the features required to enable persistence.");
        }
      });
  } catch (error) {
    console.error("Error enabling Firestore persistence:", error);
  }
}

export { app, auth, db };
