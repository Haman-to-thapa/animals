import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { blockUser } from "../controllers/blockController";

const router = Router();

router.post("/", authenticate, blockUser);

export default router;
