import { Request, Response } from "express";
import admin from "firebase-admin";
import { db } from "../config/firestore";
import { startOfToday, REPORT_THRESHOLD, DAILY_REPORT_LIMIT } from "../utils/moderation";

type TargetType = "post" | "sound" | "comment" | "adoption";

function targetCollection(type: TargetType) {
  switch (type) {
    case "post": return "posts";
    case "sound": return "sounds";
    case "comment": return "comments";
    case "adoption": return "adoptions";
  }
}

export async function createReport(req: Request, res: Response) {
  const uid = req.user?.uid;
  const { targetType, targetId, reason } = req.body as {
    targetType: TargetType; targetId: string; reason: string;
  };

  if (!uid || !targetType || !targetId || !reason) {
    return res.status(400).json({ error: "Invalid report" });
  }

  const reportsRef = db.collection("reports");
  const targetRef = db.collection(targetCollection(targetType)).doc(targetId);

  // 1) Daily limit
  const todaySnap = await reportsRef
    .where("reporterUid", "==", uid)
    .where("createdAt", ">=", startOfToday())
    .get();

  if (todaySnap.size >= DAILY_REPORT_LIMIT) {
    return res.status(429).json({ error: "Daily report limit reached" });
  }

  // 2) Duplicate report block
  const dupSnap = await reportsRef
    .where("reporterUid", "==", uid)
    .where("targetType", "==", targetType)
    .where("targetId", "==", targetId)
    .limit(1)
    .get();

  if (!dupSnap.empty) {
    return res.status(409).json({ error: "Already reported" });
  }

  // 3) Transaction: add report + increment counter + auto-hide
  await db.runTransaction(async (tx) => {
    const targetSnap = await tx.get(targetRef);
    if (!targetSnap.exists) throw new Error("TARGET_NOT_FOUND");

    const reportsCount = (targetSnap.get("reportsCount") || 0) + 1;

    tx.set(reportsRef.doc(), {
      reporterUid: uid,
      targetType,
      targetId,
      reason,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const update: any = {
      reportsCount: admin.firestore.FieldValue.increment(1),
    };

    if (reportsCount >= REPORT_THRESHOLD) {
      update.isHidden = true; // AUTO-HIDE
    }

    tx.update(targetRef, update);
  });

  return res.status(201).json({ message: "Reported" });
}
