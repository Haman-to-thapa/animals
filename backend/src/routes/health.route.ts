import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_: Request, res: Response) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

export default router;
