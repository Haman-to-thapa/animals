import { Request, Response } from "express";
import { db } from "../config/firestore"; 

export async function createPost(req: Request, res: Response) {
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

  await db.collection("posts").add(post);

  return res.status(201).json({ message: "Post created" });
}
