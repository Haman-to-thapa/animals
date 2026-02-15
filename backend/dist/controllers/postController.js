"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = createPost;
const firestore_1 = require("../config/firestore");
async function createPost(req, res) {
    const uid = req.user?.uid;
    const { caption } = req.body;
    if (!uid || !caption) {
        return res.status(400).json({ error: "Invalid data" });
    }
    const post = {
        ownerUid: uid,
        caption,
        likesCount: 0,
        reportsCount: 0,
        isHidden: false,
        createdAt: new Date()
    };
    await firestore_1.db.collection("posts").add(post);
    return res.status(201).json({ message: "Post created" });
}
