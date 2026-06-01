import type { Request, Response } from "express";
import Category from "../models/Category.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { NotFoundError } from "../utils/AppError.js";

/** GET /api/v1/categories */
export const getCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    const categories = await Category.find({}).sort({ name: 1 }).lean();
    res.json({ success: true, data: categories });
  }
);

/** GET /api/v1/categories/:slug */
export const getCategoryBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findOne({ slug: req.params.slug }).lean();

    if (!category) {
      throw new NotFoundError("Category");
    }

    res.json({ success: true, data: category });
  }
);
