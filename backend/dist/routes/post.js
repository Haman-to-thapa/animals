"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const postController_1 = require("../controllers/postController");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authenticate, postController_1.createPost);
exports.default = router;
