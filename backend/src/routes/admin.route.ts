import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";
import {
  getReports,
  setContentVisibility,
  blockUserAdmin,
  approveAdoption,
} from "../controllers/admin.controller";

const router = Router();

router.use(authenticate, adminOnly);

router.get("/reports", getReports);
router.post("/content/visibility", setContentVisibility);
router.post("/user/block", blockUserAdmin);
router.post("/adoption/approve", approveAdoption);

export default router;
