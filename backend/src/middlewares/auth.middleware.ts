import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
