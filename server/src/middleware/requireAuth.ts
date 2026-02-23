import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : queryToken;

  if (!token) {
    res.status(401).json({ message: "Missing or invalid Authorization header. Provide a Bearer token." });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await User.findById(payload.userId);

    if (!user) {
      res.status(401).json({ message: "User not found. Please sign in again." });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token. Please sign in again." });
  }
};
