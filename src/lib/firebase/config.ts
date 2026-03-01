
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore
} from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "studio-5400175364-fe933",
  appId: "1:225701234398:web:606fa4acb720e2a9a1644f",
  apiKey: "AIzaSyCX660SXd0eoxCugs7zdggQ0f9gCooFvdo",
  authDomain: "studio-5400175364-fe933.firebaseapp.com",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

/**
 * Initialize Firestore with resilient settings.
 * experimentalForceLongPolling: true is critical for bypassing ad-blockers/VPNs.
 * It forces the database to use standard HTTPS requests instead of WebSockets.
 */
let db;
if (getApps().length > 0) {
    try {
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager(),
            }),
            experimentalForceLongPolling: true,
        });
    } catch (e) {
        // If already initialized (e.g. during Hot Module Replacement), get the existing instance
        db = getFirestore(app);
    }
} else {
    db = getFirestore(app);
}

export { app, auth, db };
