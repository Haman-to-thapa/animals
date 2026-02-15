import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { likePost, unlikePost } from "../controllers/like.controller";

const router = Router();

router.post("/like", authenticate, likePost);
router.post("/unlike", authenticate, unlikePost);

export default router;
