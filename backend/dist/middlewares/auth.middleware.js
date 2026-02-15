"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const firebase_1 = require("../config/firebase");
async function authenticate(req, res, next) {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const decoded = await firebase_1.firebaseAuth.verifyIdToken(token);
        req.user = {
            uid: decoded.uid,
            email: decoded.email || null,
        };
        next();
    }
    catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
