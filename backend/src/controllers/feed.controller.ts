import { Request, Response } from "express";
import { db } from "../config/firestore";
import admin from "firebase-admin";
import { any } from "zod";

async function getBlockedUids(uid: string): Promise<string[]> {
  const snap = await db
    .collection("blocks")
    .where("blockerUid", "==", uid)
    .get();

  return snap.docs.map(d => d.data().blockedUid);
}




export async function getPosts(req: Request, res: Response) {
  const uid = req.user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });

  const limit = Math.min(Number(req.query.limit) || 10, 10);
  const cursor = req.query.cursor as string | undefined;

  const blockedUids = await getBlockedUids(uid);

  let query = db
    .collection("posts")
    .where("isHidden", "==", false)
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (cursor) {
    const ts = admin.firestore.Timestamp.fromMillis(Number(cursor));
    query = query.startAfter(ts);
  }

  const snap = await query.get();

  const items = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter((p:any) => !blockedUids.includes(p.ownerUid));

  const nextCursor =
    snap.docs.length > 0
      ? snap.docs[snap.docs.length - 1].get("createdAt").toMillis()
      : null;

  return res.json({ items, nextCursor });
}