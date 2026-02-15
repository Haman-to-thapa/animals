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
            console.log("Found FIREBASE_SERVICE_ACCOUNT, attempting to parse...");
            const serviceAccount = JSON.parse(ENV.FIREBASE_SERVICE_ACCOUNT);
            console.log("Successfully parsed service account. Project ID:", serviceAccount.project_id);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("Firebase initialized with Service Account.");
        } catch (error) {
            console.error("CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON.", error);
            console.error("Ensure the environment variable does not have extra quotes and is valid JSON.");
            process.exit(1);
        }
    } else {
        console.log("FIREBASE_SERVICE_ACCOUNT not set. Attempting applicationDefault() credential...");
        try {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: ENV.FIREBASE_PROJECT_ID,
            });
            console.log("Firebase initialized with default credentials.");
        } catch (error) {
            console.error("CRITICAL: Failed to initialize with applicationDefault().");
            console.error("On non-GCP environments (like Render/Heroku), you MUST set FIREBASE_SERVICE_ACCOUNT.");
            console.error("Error details:", error);
            process.exit(1);
        }
    }
}

export const db = admin.firestore();
export const firebaseAuth = admin.auth();
