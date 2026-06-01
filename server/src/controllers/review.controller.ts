import type { Request, Response } from "express";
import Review from "../models/Review.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError, NotFoundError } from "../utils/AppError.js";

/** POST /api/v1/reviews */
export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { product, rating, comment } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user?._id,
      product,
    });

    if (existingReview) {
      throw new AppError("You have already reviewed this product", 400);
    }

    // Get images from uploaded files
    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        // Images are processed by upload middleware
        if (file.path) {
          images.push(file.path);
        }
      }
    }

    const review = await Review.create({
      product,
      user: req.user?._id,
      rating,
      comment,
      images: (req.body.images as string[]) || images,
    });

    const populated = await Review.findById(review._id)
      .populate("user", "name avatar")
      .lean();

    res.status(201).json({ success: true, data: populated });
  }
);

/** GET /api/v1/reviews/product/:productId */
export const getProductReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId, isApproved: true })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({
        product: req.params.productId,
        isApproved: true,
      }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }
);

/** POST /api/v1/reviews/:id/helpful */
export const voteHelpful = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new NotFoundError("Review");
  }

  review.helpfulVotes += 1;
  await review.save();

  res.json({ success: true, data: { helpfulVotes: review.helpfulVotes } });
});

/** DELETE /api/v1/reviews/:id */
export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new NotFoundError("Review");
    }

    // Only review author or admin can delete
    if (
      review.user.toString() !== req.user?._id &&
      req.user?.role !== "admin"
    ) {
      throw new AppError("Not authorized to delete this review", 403);
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Review deleted" });
  }
);
