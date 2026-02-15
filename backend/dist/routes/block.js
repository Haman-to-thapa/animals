"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const blockController_1 = require("../controllers/blockController");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authenticate, blockController_1.blockUser);
exports.default = router;
