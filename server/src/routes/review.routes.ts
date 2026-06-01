import { Router } from "express";
import {
  createReview,
  getProductReviews,
  voteHelpful,
  deleteReview,
} from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { createReviewSchema } from "../validators/review.validator.js";

const router = Router();

router.get("/product/:productId", getProductReviews);

// Protected routes
router.post("/", protect, validate(createReviewSchema), createReview);
router.post("/:id/helpful", protect, voteHelpful);
router.delete("/:id", protect, deleteReview);

export default router;
