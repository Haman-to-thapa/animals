import { Request, Response } from "express";
import { db } from "../config/firestore";

export async function createReport(req: Request, res: Response) {
  const uid = req.user?.uid;
  const { targetType, targetId, reason } = req.body;

  if (!uid || !targetType || !targetId || !reason) {
    return res.status(400).json({ error: "Invalid report" });
  }

  await db.collection("reports").add({
    reporterUid: uid,
    targetType,
    targetId,
    reason,
    createdAt: new Date()
  });

  return res.status(201).json({ message: "Reported" });
}
