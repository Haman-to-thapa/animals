"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = initCronJobs;
const firestore_1 = require("../config/firestore");
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
function initCronJobs() {
    console.log("Initializing cron jobs...");
    // Run cleanup immediately on startup
    cleanupOldAdminMessages();
    // Then run every 24 hours
    setInterval(cleanupOldAdminMessages, 24 * 60 * 60 * 1000);
}
async function cleanupOldAdminMessages() {
    try {
        const cutoffDate = new Date(Date.now() - THREE_DAYS_MS);
        console.log(`[Cron] Cleaning up admin messages older than ${cutoffDate.toISOString()}...`);
        const snapshot = await firestore_1.db.collection("adminMessages")
            .where("createdAt", "<", cutoffDate)
            .get();
        if (snapshot.empty) {
            console.log("[Cron] No old admin messages found.");
            return;
        }
        const batch = firestore_1.db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`[Cron] Deleted ${snapshot.size} old admin messages.`);
    }
    catch (error) {
        console.error("[Cron] Error cleaning up admin messages:", error);
    }
}
