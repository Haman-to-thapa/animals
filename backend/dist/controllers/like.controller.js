"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = likePost;
exports.unlikePost = unlikePost;
const firestore_1 = require("../config/firestore");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
async function likePost(req, res) {
    const uid = req.user?.uid;
    const { postId } = req.body;
    if (!uid || !postId) {
        return res.status(400).json({ error: "Invalid request" });
    }
    const likeId = `${uid}_${postId}`;
    const likeRef = firestore_1.db.collection("likes").doc(likeId);
    const postRef = firestore_1.db.collection("posts").doc(postId);
    await firestore_1.db.runTransaction(async (tx) => {
        const likeSnap = await tx.get(likeRef);
        if (likeSnap.exists) {
            throw new Error("ALREADY_LIKED");
        }
        tx.set(likeRef, {
            userUid: uid,
            postId,
            createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        });
        tx.update(postRef, {
            likesCount: firebase_admin_1.default.firestore.FieldValue.increment(1),
        });
    });
    return res.json({ message: "Liked" });
}
async function unlikePost(req, res) {
    const uid = req.user?.uid;
    const { postId } = req.body;
    if (!uid || !postId) {
        return res.status(400).json({ error: "Invalid request" });
    }
    const likeId = `${uid}_${postId}`;
    const likeRef = firestore_1.db.collection("likes").doc(likeId);
    const postRef = firestore_1.db.collection("posts").doc(postId);
    await firestore_1.db.runTransaction(async (tx) => {
        const likeSnap = await tx.get(likeRef);
        if (!likeSnap.exists) {
            throw new Error("NOT_LIKED");
        }
        tx.delete(likeRef);
        tx.update(postRef, {
            likesCount: firebase_admin_1.default.firestore.FieldValue.increment(-1),
        });
    });
    return res.json({ message: "Unliked" });
}
