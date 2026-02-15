"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockUser = blockUser;
const firestore_1 = require("../config/firestore");
async function blockUser(req, res) {
    const uid = req.user?.uid;
    const { blockedUid } = req.body;
    if (!uid || !blockedUid) {
        return res.status(400).json({ error: "Invalid request" });
    }
    await firestore_1.db.collection("blocks").add({
        blockerUid: uid,
        blockedUid,
        createdAt: new Date()
    });
    return res.status(201).json({ message: "User blocked" });
}
