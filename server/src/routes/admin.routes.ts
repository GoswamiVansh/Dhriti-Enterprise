import { Router } from "express";
import { protect, isAdmin } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { createProductSchema, updateProductSchema } from "../validators/product.validator.js";
import { updateOrderStatusSchema } from "../validators/order.validator.js";
import { createCouponSchema } from "../validators/coupon.validator.js";
import {
  getDashboard,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminGetAllUsers,
  adminUpdateUserRole,
  adminDeleteUser,
  adminGetAllReviews,
  adminToggleReviewApproval,
  adminDeleteReview,
  adminGetAllCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require auth + admin role
router.use(protect, isAdmin);

// Dashboard
router.get("/dashboard", getDashboard);

// Products
router.post("/products", validate(createProductSchema), adminCreateProduct);
router.put("/products/:id", validate(updateProductSchema), adminUpdateProduct);
router.delete("/products/:id", adminDeleteProduct);

// Categories
router.post("/categories", adminCreateCategory);
router.put("/categories/:id", adminUpdateCategory);
router.delete("/categories/:id", adminDeleteCategory);

// Orders
router.get("/orders", adminGetAllOrders);
router.put(
  "/orders/:id/status",
  validate(updateOrderStatusSchema),
  adminUpdateOrderStatus
);

// Users
router.get("/users", adminGetAllUsers);
router.put("/users/:id/role", adminUpdateUserRole);
router.delete("/users/:id", adminDeleteUser);

// Reviews
router.get("/reviews", adminGetAllReviews);
router.put("/reviews/:id/toggle-approval", adminToggleReviewApproval);
router.delete("/reviews/:id", adminDeleteReview);

// Coupons
router.get("/coupons", adminGetAllCoupons);
router.post("/coupons", validate(createCouponSchema), adminCreateCoupon);
router.put("/coupons/:id", adminUpdateCoupon);
router.delete("/coupons/:id", adminDeleteCoupon);

export default router;
