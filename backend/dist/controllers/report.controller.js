"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReport = createReport;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firestore_1 = require("../config/firestore");
const moderation_1 = require("../utils/moderation");
function targetCollection(type) {
    switch (type) {
        case "post": return "posts";
        case "sound": return "sounds";
        case "comment": return "comments";
        case "adoption": return "adoptions";
    }
}
async function createReport(req, res) {
    const uid = req.user?.uid;
    const { targetType, targetId, reason } = req.body;
    if (!uid || !targetType || !targetId || !reason) {
        return res.status(400).json({ error: "Invalid report" });
    }
    const reportsRef = firestore_1.db.collection("reports");
    const targetRef = firestore_1.db.collection(targetCollection(targetType)).doc(targetId);
    // 1) Daily limit
    const todaySnap = await reportsRef
        .where("reporterUid", "==", uid)
        .where("createdAt", ">=", (0, moderation_1.startOfToday)())
        .get();
    if (todaySnap.size >= moderation_1.DAILY_REPORT_LIMIT) {
        return res.status(429).json({ error: "Daily report limit reached" });
    }
    // 2) Duplicate report block
    const dupSnap = await reportsRef
        .where("reporterUid", "==", uid)
        .where("targetType", "==", targetType)
        .where("targetId", "==", targetId)
        .limit(1)
        .get();
    if (!dupSnap.empty) {
        return res.status(409).json({ error: "Already reported" });
    }
    // 3) Transaction: add report + increment counter + auto-hide
    await firestore_1.db.runTransaction(async (tx) => {
        const targetSnap = await tx.get(targetRef);
        if (!targetSnap.exists)
            throw new Error("TARGET_NOT_FOUND");
        const reportsCount = (targetSnap.get("reportsCount") || 0) + 1;
        tx.set(reportsRef.doc(), {
            reporterUid: uid,
            targetType,
            targetId,
            reason,
            createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        });
        const update = {
            reportsCount: firebase_admin_1.default.firestore.FieldValue.increment(1),
        };
        if (reportsCount >= moderation_1.REPORT_THRESHOLD) {
            update.isHidden = true; // AUTO-HIDE
        }
        tx.update(targetRef, update);
    });
    return res.status(201).json({ message: "Reported" });
}
