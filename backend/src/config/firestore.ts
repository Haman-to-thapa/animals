import admin from "firebase-admin";
import { ENV } from "./env";

console.log("Initializing Firebase Config...");

// Ensure GCLOUD_PROJECT is matched if provided
if (ENV.FIREBASE_PROJECT_ID && !process.env.GCLOUD_PROJECT) {
    process.env.GCLOUD_PROJECT = ENV.FIREBASE_PROJECT_ID;
}

if (!admin.apps.length) {
    if (ENV.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(ENV.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("Firebase initialized with Service Account.");
        } catch (error) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON.", error);
        }
    } else {
        try {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: ENV.FIREBASE_PROJECT_ID,
            });
            console.log("Firebase initialized with default credentials.");
        } catch (error) {
            console.error("Failed to initialize with applicationDefault().");
            console.error("On non-GCP environments, ensure FIREBASE_SERVICE_ACCOUNT is set.");

            // Fallback to dummy init to prevent crash
            try {
                admin.initializeApp({ projectId: 'failed-init-dummy' });
            } catch (e) {
                // Ignore dummy init error
            }
        }
    }
}

export const db = admin.firestore();
export const firebaseAuth = admin.auth();
