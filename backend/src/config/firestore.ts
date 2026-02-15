import admin from "firebase-admin";
import { ENV } from "./env";

console.log("Initializing Firebase Config...");

// Ensure GCLOUD_PROJECT is matched if provided
if (ENV.FIREBASE_PROJECT_ID && !process.env.GCLOUD_PROJECT) {
    process.env.GCLOUD_PROJECT = ENV.FIREBASE_PROJECT_ID;
}

if (!admin.apps.length) {
    console.log("--> CHECKING FIREBASE CONFIG <--");
    console.log(`--> FIREBASE_SERVICE_ACCOUNT exists? ${!!ENV.FIREBASE_SERVICE_ACCOUNT}`);
    // ... (previous code)
} catch (error) {
    console.error("--> FATAL ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON.", error);
}
    } else {
    console.log("--> FIREBASE_SERVICE_ACCOUNT not set. Attempting applicationDefault()...");
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: ENV.FIREBASE_PROJECT_ID,
        });
        console.log("--> Firebase initialized with default credentials.");
    } catch (error) {
        console.error("--> CRITICAL: Failed to initialize with applicationDefault().");
        console.error("--> On non-GCP environments (like Render/Heroku), you MUST set FIREBASE_SERVICE_ACCOUNT.");
        console.error("--> Error details:", error);
        // DO NOT EXIT. Initialize a dummy app to prevent 'admin.firestore()' from throwing.
        try {
            console.log("--> WARNING: Initializing DUMMY Firebase app to keep server alive.");
            admin.initializeApp({ projectId: 'failed-init-dummy' });
        } catch (e) {
            console.error("--> EVEN DUMMY INIT FAILED:", e);
        }
    }
}
}
}

export const db = admin.firestore();
export const firebaseAuth = admin.auth();
