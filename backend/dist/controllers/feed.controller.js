"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPosts = getPosts;
const firestore_1 = require("../config/firestore");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
async function getBlockedUids(uid) {
    const snap = await firestore_1.db
        .collection("blocks")
        .where("blockerUid", "==", uid)
        .get();
    return snap.docs.map(d => d.data().blockedUid);
}
async function getPosts(req, res) {
    const uid = req.user?.uid;
    if (!uid)
        return res.status(401).json({ error: "Unauthorized" });
    const limit = Math.min(Number(req.query.limit) || 10, 10);
    const cursor = req.query.cursor;
    const blockedUids = await getBlockedUids(uid);
    let query = firestore_1.db
        .collection("posts")
        .where("isHidden", "==", false)
        .orderBy("createdAt", "desc")
        .limit(limit);
    if (cursor) {
        const ts = firebase_admin_1.default.firestore.Timestamp.fromMillis(Number(cursor));
        query = query.startAfter(ts);
    }
    const snap = await query.get();
    const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((p) => !blockedUids.includes(p.ownerUid));
    const nextCursor = snap.docs.length > 0
        ? snap.docs[snap.docs.length - 1].get("createdAt").toMillis()
        : null;
    return res.json({ items, nextCursor });
}
