import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { createPost } from "../controllers/postController"; 
const router = Router();

router.post("/", authenticate, createPost);

export default router;
