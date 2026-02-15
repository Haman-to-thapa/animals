import { Request, Response } from "express";
import { db } from "../config/firestore";

export async function getReports(req: Request, res: Response) {
  const snap = await db
    .collection("reports")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const reports = snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));

  return res.json({ reports });
}


type TargetType = "post" | "sound" | "comment" | "adoption";

function targetCollection(type: TargetType) {
  switch (type) {
    case "post": return "posts";
    case "sound": return "sounds";
    case "comment": return "comments";
    case "adoption": return "adoptions";
  }
}

export async function setContentVisibility(req: Request, res: Response) {
  const { targetType, targetId, hidden } = req.body as {
    targetType: TargetType;
    targetId: string;
    hidden: boolean;
  };

  if (!targetType || !targetId || hidden === undefined) {
    return res.status(400).json({ error: "Invalid request" });
  }

  await db
    .collection(targetCollection(targetType))
    .doc(targetId)
    .update({ isHidden: hidden });

  return res.json({ message: hidden ? "Hidden" : "Unhidden" });
}


export async function blockUserAdmin(req: Request, res: Response) {
  const { uid, blocked } = req.body as {
    uid: string;
    blocked: boolean;
  };

  if (!uid || blocked === undefined) {
    return res.status(400).json({ error: "Invalid request" });
  }

  await db.collection("users").doc(uid).update({
    isBlocked: blocked,
    blockedUntil: blocked ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
  });

  return res.json({ message: blocked ? "User blocked" : "User unblocked" });
}


export async function approveAdoption(req: Request, res: Response) {
  const { adoptionId, approved } = req.body as {
    adoptionId: string;
    approved: boolean;
  };

  if (!adoptionId || approved === undefined) {
    return res.status(400).json({ error: "Invalid request" });
  }

  await db.collection("adoptions").doc(adoptionId).update({
    isApproved: approved,
    isHidden: !approved,
  });

  return res.json({ message: approved ? "Adoption approved" : "Adoption rejected" });
}
