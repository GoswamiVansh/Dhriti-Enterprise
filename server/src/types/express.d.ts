import type { TokenPayload } from "../utils/generateToken.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { _id: string };
      userId?: string;
    }
  }
}

export {};
