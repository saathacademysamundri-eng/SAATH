
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "studio-5400175364-fe933",
  appId: "1:225701234398:web:606fa4acb720e2a9a1644f",
  apiKey: "AIzaSyCX660SXd0eoxCugs7zdggQ0f9gCooFvdo",
  authDomain: "studio-5400175364-fe933.firebaseapp.com",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
