"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const env_1 = require("./env");
console.log("Initializing Firebase Config...");
// Ensure GCLOUD_PROJECT is matched if provided
if (env_1.ENV.FIREBASE_PROJECT_ID && !process.env.GCLOUD_PROJECT) {
    process.env.GCLOUD_PROJECT = env_1.ENV.FIREBASE_PROJECT_ID;
}
if (!firebase_admin_1.default.apps.length) {
    console.log("--> CHECKING FIREBASE CONFIG <--");
    console.log(`--> FIREBASE_SERVICE_ACCOUNT exists? ${!!env_1.ENV.FIREBASE_SERVICE_ACCOUNT}`);
    if (env_1.ENV.FIREBASE_SERVICE_ACCOUNT) {
        console.log(`--> FIREBASE_SERVICE_ACCOUNT length: ${env_1.ENV.FIREBASE_SERVICE_ACCOUNT.length}`);
        try {
            console.log("--> Attempting to parse JSON...");
            const serviceAccount = JSON.parse(env_1.ENV.FIREBASE_SERVICE_ACCOUNT);
            console.log("--> JSON Parsed. Project ID:", serviceAccount.project_id);
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount),
            });
            console.log("--> Firebase initialized with Service Account. SUCCESS.");
        }
        catch (error) {
            console.error("--> FATAL ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON.", error);
            console.error("--> RAW VALUE (First 50 chars):", env_1.ENV.FIREBASE_SERVICE_ACCOUNT.substring(0, 50));
            // Do not exit immediately, let it crash naturally or try default
        }
    }
    else {
        console.log("--> FIREBASE_SERVICE_ACCOUNT not set. Attempting applicationDefault()...");
        try {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.applicationDefault(),
                projectId: env_1.ENV.FIREBASE_PROJECT_ID,
            });
            console.log("Firebase initialized with default credentials.");
        }
        catch (error) {
            console.error("CRITICAL: Failed to initialize with applicationDefault().");
            console.error("On non-GCP environments (like Render/Heroku), you MUST set FIREBASE_SERVICE_ACCOUNT.");
            console.error("Error details:", error);
            process.exit(1);
        }
    }
}
exports.db = firebase_admin_1.default.firestore();
exports.firebaseAuth = firebase_admin_1.default.auth();
