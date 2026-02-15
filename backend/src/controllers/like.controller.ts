import { Request, Response } from "express";
import { db } from "../config/firestore";
import admin from "firebase-admin";

export async function likePost(req: Request, res: Response) {
  const uid = req.user?.uid;
  const { postId } = req.body;

  if (!uid || !postId) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const likeId = `${uid}_${postId}`;
  const likeRef = db.collection("likes").doc(likeId);
  const postRef = db.collection("posts").doc(postId);

  await db.runTransaction(async (tx) => {
    const likeSnap = await tx.get(likeRef);
    if (likeSnap.exists) {
      throw new Error("ALREADY_LIKED");
    }

    tx.set(likeRef, {
      userUid: uid,
      postId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.update(postRef, {
      likesCount: admin.firestore.FieldValue.increment(1),
    });
  });

  return res.json({ message: "Liked" });
}



export async function unlikePost(req: Request, res: Response) {
  const uid = req.user?.uid;
  const { postId } = req.body;

  if (!uid || !postId) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const likeId = `${uid}_${postId}`;
  const likeRef = db.collection("likes").doc(likeId);
  const postRef = db.collection("posts").doc(postId);

  await db.runTransaction(async (tx) => {
    const likeSnap = await tx.get(likeRef);
    if (!likeSnap.exists) {
      throw new Error("NOT_LIKED");
    }

    tx.delete(likeRef);
    tx.update(postRef, {
      likesCount: admin.firestore.FieldValue.increment(-1),
    });
  });

  return res.json({ message: "Unliked" });
}
