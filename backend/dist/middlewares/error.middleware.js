"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    console.error("❌ Error:", err);
    if (res.headersSent) {
        return next(err);
    }
    return res.status(500).json({
        error: "Internal server error",
    });
}
