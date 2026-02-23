import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
export const requireAuth = async (req, res, next) => {
    const header = req.headers.authorization;
    const queryToken = req.query.token;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : queryToken;
    if (!token) {
        res.status(401).json({ message: "Missing or invalid Authorization header. Provide a Bearer token." });
        return;
    }
    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        const user = await User.findById(payload.userId);
        if (!user) {
            res.status(401).json({ message: "User not found. Please sign in again." });
            return;
        }
        req.user = user;
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid or expired token. Please sign in again." });
    }
};
//# sourceMappingURL=requireAuth.js.map