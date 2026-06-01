import type { Request, Response } from "express";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { NotFoundError } from "../utils/AppError.js";

/** POST /api/v1/users/wishlist/:productId */
export const addToWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);
    if (!user) throw new NotFoundError("User");

    const productId = req.params.productId;

    if (!user.wishlist.some((id) => id.toString() === productId)) {
      user.wishlist.push(productId as unknown as import("mongoose").Types.ObjectId);
      await user.save();
    }

    res.json({ success: true, data: user.wishlist });
  }
);

/** DELETE /api/v1/users/wishlist/:productId */
export const removeFromWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);
    if (!user) throw new NotFoundError("User");

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.productId
    );
    await user.save();

    res.json({ success: true, data: user.wishlist });
  }
);

/** GET /api/v1/users/wishlist */
export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?._id)
    .populate("wishlist", "name slug price unit images mainImage material averageRating inStock")
    .lean();

  if (!user) throw new NotFoundError("User");

  res.json({ success: true, data: user.wishlist });
});

/** POST /api/v1/users/recently-viewed/:productId */
export const addRecentlyViewed = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);
    if (!user) throw new NotFoundError("User");

    const productId = req.params.productId;

    // Remove if already exists
    user.recentlyViewed = user.recentlyViewed.filter(
      (rv) => rv.product.toString() !== productId
    );

    // Add to front
    user.recentlyViewed.unshift({
      product: productId as unknown as import("mongoose").Types.ObjectId,
      viewedAt: new Date(),
    });

    // Keep only last 20
    user.recentlyViewed = user.recentlyViewed.slice(0, 20);

    await user.save();

    res.json({ success: true, message: "Added to recently viewed" });
  }
);

/** GET /api/v1/users/recently-viewed */
export const getRecentlyViewed = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id)
      .populate(
        "recentlyViewed.product",
        "name slug price unit images mainImage material averageRating inStock"
      )
      .lean();

    if (!user) throw new NotFoundError("User");

    res.json({ success: true, data: user.recentlyViewed });
  }
);
