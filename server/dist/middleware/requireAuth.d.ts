import type { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
declare global {
    namespace Express {
        interface Request {
            user?: InstanceType<typeof User>;
        }
    }
}
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=requireAuth.d.ts.map