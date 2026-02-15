"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const feed_controller_1 = require("../controllers/feed.controller");
const router = (0, express_1.Router)();
router.get("/posts", auth_middleware_1.authenticate, feed_controller_1.getPosts);
exports.default = router;
