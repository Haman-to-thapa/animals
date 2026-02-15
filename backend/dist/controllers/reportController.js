"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReport = createReport;
const firestore_1 = require("../config/firestore");
async function createReport(req, res) {
    const uid = req.user?.uid;
    const { targetType, targetId, reason } = req.body;
    if (!uid || !targetType || !targetId || !reason) {
        return res.status(400).json({ error: "Invalid report" });
    }
    await firestore_1.db.collection("reports").add({
        reporterUid: uid,
        targetType,
        targetId,
        reason,
        createdAt: new Date()
    });
    return res.status(201).json({ message: "Reported" });
}
