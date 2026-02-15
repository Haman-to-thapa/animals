import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

export async function adminOnly(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uid = req.user?.uid;
  if (!uid) return res.status(403).json({ error: "Forbidden" });

  const user = await admin.firestore().doc(`users/${uid}`).get();
  if (user.data()?.role !== "admin") {
    return res.status(403).json({ error: "Admins only" });
  }

  next();
}
