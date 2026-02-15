"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const firestore_1 = require("../config/firestore");
async function authenticate(req, res, next) {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const decoded = await firestore_1.firebaseAuth.verifyIdToken(token);
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
