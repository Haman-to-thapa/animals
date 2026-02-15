"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReports = getReports;
exports.setContentVisibility = setContentVisibility;
exports.blockUserAdmin = blockUserAdmin;
exports.approveAdoption = approveAdoption;
const firestore_1 = require("../config/firestore");
async function getReports(req, res) {
    const snap = await firestore_1.db
        .collection("reports")
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();
    const reports = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
    }));
    return res.json({ reports });
}
function targetCollection(type) {
    switch (type) {
        case "post": return "posts";
        case "sound": return "sounds";
        case "comment": return "comments";
        case "adoption": return "adoptions";
    }
}
async function setContentVisibility(req, res) {
    const { targetType, targetId, hidden } = req.body;
    if (!targetType || !targetId || hidden === undefined) {
        return res.status(400).json({ error: "Invalid request" });
    }
    await firestore_1.db
        .collection(targetCollection(targetType))
        .doc(targetId)
        .update({ isHidden: hidden });
    return res.json({ message: hidden ? "Hidden" : "Unhidden" });
}
async function blockUserAdmin(req, res) {
    const { uid, blocked } = req.body;
    if (!uid || blocked === undefined) {
        return res.status(400).json({ error: "Invalid request" });
    }
    await firestore_1.db.collection("users").doc(uid).update({
        isBlocked: blocked,
        blockedUntil: blocked ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
    });
    return res.json({ message: blocked ? "User blocked" : "User unblocked" });
}
async function approveAdoption(req, res) {
    const { adoptionId, approved } = req.body;
    if (!adoptionId || approved === undefined) {
        return res.status(400).json({ error: "Invalid request" });
    }
    await firestore_1.db.collection("adoptions").doc(adoptionId).update({
        isApproved: approved,
        isHidden: !approved,
    });
    return res.json({ message: approved ? "Adoption approved" : "Adoption rejected" });
}
