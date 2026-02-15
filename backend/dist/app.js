"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const health_route_1 = __importDefault(require("./routes/health.route"));
const post_1 = __importDefault(require("./routes/post"));
const report_1 = __importDefault(require("./routes/report"));
const block_1 = __importDefault(require("./routes/block"));
const feed_route_1 = __importDefault(require("./routes/feed.route"));
const like_route_1 = __importDefault(require("./routes/like.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const app = (0, express_1.default)();
/* SECURITY MIDDLEWARE */
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json({ limit: "100kb" })); // prevent abuse
app.use(rateLimit_middleware_1.rateLimiter);
/* ROUTES */
app.use("/health", health_route_1.default);
app.use("/posts", post_1.default);
app.use("/reports", report_1.default);
app.use("/blocks", block_1.default);
app.use("/feed", feed_route_1.default);
app.use("/likes", like_route_1.default);
app.use("/admin", admin_route_1.default);
app.use("/ai", aiRoutes_1.default);
/* ERROR HANDLER */
app.use(error_middleware_1.errorHandler);
exports.default = app;
