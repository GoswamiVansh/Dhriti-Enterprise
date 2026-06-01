import type { Request, Response } from "express";
import Product from "../models/Product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { NotFoundError } from "../utils/AppError.js";

/** GET /api/v1/products — paginated, filtered, sorted */
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: Record<string, unknown> = {};

  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.material) {
    filter.material = { $regex: req.query.material, $options: "i" };
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice)
      (filter.price as Record<string, number>).$gte = Number(req.query.minPrice);
    if (req.query.maxPrice)
      (filter.price as Record<string, number>).$lte = Number(req.query.maxPrice);
  }
  if (req.query.inStock === "true") {
    filter.inStock = true;
  }
  if (req.query.featured === "true") {
    filter.isFeatured = true;
  }
  if (req.query.search) {
    filter.$text = { $search: req.query.search as string };
  }

  // Build sort
  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  if (req.query.sort) {
    const sortStr = req.query.sort as string;
    switch (sortStr) {
      case "price_asc":
        sortObj = { price: 1 };
        break;
      case "price_desc":
        sortObj = { price: -1 };
        break;
      case "name_asc":
        sortObj = { name: 1 };
        break;
      case "name_desc":
        sortObj = { name: -1 };
        break;
      case "rating":
        sortObj = { averageRating: -1 };
        break;
      case "newest":
        sortObj = { createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/** GET /api/v1/products/:id */
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .lean();

    if (!product) {
      throw new NotFoundError("Product");
    }

    res.json({ success: true, data: product });
  }
);

/** GET /api/v1/products/slug/:slug */
export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      throw new NotFoundError("Product");
    }

    res.json({ success: true, data: product });
  }
);

/** GET /api/v1/products/:id/related */
export const getRelatedProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      throw new NotFoundError("Product");
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .lean();

    res.json({ success: true, data: related });
  }
);
