import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { createReport } from "../controllers/reportController";

const router = Router();

router.post("/", authenticate, createReport);

export default router;
