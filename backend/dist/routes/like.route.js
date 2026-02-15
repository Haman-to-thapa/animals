"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const like_controller_1 = require("../controllers/like.controller");
const router = (0, express_1.Router)();
router.post("/like", auth_middleware_1.authenticate, like_controller_1.likePost);
router.post("/unlike", auth_middleware_1.authenticate, like_controller_1.unlikePost);
exports.default = router;
