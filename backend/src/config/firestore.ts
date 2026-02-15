import admin from "firebase-admin";
import { ENV } from "./env";

if (!admin.apps.length) {
    if (ENV.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(ENV.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } catch (error) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
            process.exit(1);
        }
    } else {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    }
}

export const db = admin.firestore();
