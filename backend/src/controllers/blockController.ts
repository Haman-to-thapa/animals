import { Request, Response } from "express";
import { db } from "../config/firestore";

export async function blockUser(req: Request, res: Response) {
  const uid = req.user?.uid;
  const { blockedUid } = req.body;

  if (!uid || !blockedUid) {
    return res.status(400).json({ error: "Invalid request" });
  }

  await db.collection("blocks").add({
    blockerUid: uid,
    blockedUid,
    createdAt: new Date()
  });

  return res.status(201).json({ message: "User blocked" });
}
