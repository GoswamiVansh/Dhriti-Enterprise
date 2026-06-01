import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeGuestCart,
  applyCoupon,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// All cart routes require authentication
router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:productId", removeFromCart);
router.delete("/clear", clearCart);
router.post("/merge", mergeGuestCart);
router.post("/apply-coupon", applyCoupon);

export default router;
