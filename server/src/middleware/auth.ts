import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import { UnauthorizedError, ForbiddenError } from "../utils/AppError.js";
import type { TokenPayload } from "../utils/generateToken.js";

function isTokenPayload(payload: unknown): payload is TokenPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "_id" in payload &&
    "role" in payload
  );
}

/** Require authentication — extracts JWT from cookie or Authorization header */
function protect(req: Request, _res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    // Check HTTP-only cookie first
    const cookies = req.cookies as Record<string, string | undefined>;
    if (cookies?.jwt) {
      token = cookies.jwt;
    }
    // Fallback to Authorization header
    else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new UnauthorizedError("Not authorized, no token");
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (!isTokenPayload(decoded)) {
      throw new UnauthorizedError("Not authorized, invalid token payload");
    }

    req.user = decoded as TokenPayload & { _id: string };
    req.userId = decoded._id;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Token expired, please login again"));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Not authorized, invalid token"));
      return;
    }
    next(error);
  }
}

/** Require admin role — must be used after protect */
function isAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    next(new ForbiddenError("Not authorized as admin"));
  }
}

export { protect, isAdmin };
