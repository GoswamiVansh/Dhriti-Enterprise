import jwt from "jsonwebtoken";
import type { Response } from "express";
import config from "../config/env.js";

interface TokenPayload {
  _id: string;
  role: string;
}

function generateToken(res: Response, userId: string, role: string): string {
  const payload: TokenPayload = { _id: userId, role };

  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });

  const isDev = config.IS_DEV;

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: !isDev,
    sameSite: isDev ? "lax" : "none",
    domain: config.COOKIE_DOMAIN,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
}

export default generateToken;
export type { TokenPayload };
