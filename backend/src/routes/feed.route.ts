import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getPosts } from "../controllers/feed.controller";

const router = Router();

router.get("/posts", authenticate, getPosts);

export default router;
