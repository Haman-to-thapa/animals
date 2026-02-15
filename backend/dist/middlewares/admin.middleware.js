"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = adminOnly;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
async function adminOnly(req, res, next) {
    const uid = req.user?.uid;
    if (!uid)
        return res.status(403).json({ error: "Forbidden" });
    const user = await firebase_admin_1.default.firestore().doc(`users/${uid}`).get();
    if (user.data()?.role !== "admin") {
        return res.status(403).json({ error: "Admins only" });
    }
    next();
}
