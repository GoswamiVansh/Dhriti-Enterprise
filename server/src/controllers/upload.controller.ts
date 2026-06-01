import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { processAndSaveImage } from "../middleware/upload.js";
import { AppError } from "../utils/AppError.js";

/** POST /api/v1/upload — upload one or more images */
export const uploadImages = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new AppError("No files uploaded", 400);
    }

    const subDir = (req.query.type as string) || "products";
    const urls: string[] = [];

    for (const file of req.files) {
      const url = await processAndSaveImage(
        file,
        subDir
      );
      urls.push(url);
    }

    res.json({ success: true, data: urls });
  }
);
