import { Router } from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  addRecentlyViewed,
  getRecentlyViewed,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

// Wishlist
router.get("/wishlist", getWishlist);
router.post("/wishlist/:productId", addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);

// Recently viewed
router.get("/recently-viewed", getRecentlyViewed);
router.post("/recently-viewed/:productId", addRecentlyViewed);

export default router;
