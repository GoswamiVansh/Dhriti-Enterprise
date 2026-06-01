import type { Request, Response } from "express";
import Product from "../models/Product.model.js";
import Category from "../models/Category.model.js";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";
import Review from "../models/Review.model.js";
import Coupon from "../models/Coupon.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError, NotFoundError } from "../utils/AppError.js";

// ──── Dashboard ────
export const getDashboard = asyncHandler(
  async (_req: Request, res: Response) => {
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: "user" }),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .lean(),
      Product.find({ stockQuantity: { $lte: 5 }, inStock: true })
        .select("name stockQuantity")
        .lean(),
    ]);

    // Monthly sales for chart
    const monthlySales = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders,
        lowStockProducts,
        monthlySales,
      },
    });
  }
);

// ──── Product CRUD ────
export const adminCreateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  }
);

export const adminUpdateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new NotFoundError("Product");

    Object.assign(product, req.body);
    const updated = await product.save();

    res.json({ success: true, data: updated });
  }
);

export const adminDeleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new NotFoundError("Product");
    res.json({ success: true, message: "Product deleted" });
  }
);

// ──── Category CRUD ────
export const adminCreateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  }
);

export const adminUpdateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw new NotFoundError("Category");

    Object.assign(category, req.body);
    const updated = await category.save();

    res.json({ success: true, data: updated });
  }
);

export const adminDeleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    // Check if products exist in this category
    const productCount = await Product.countDocuments({
      category: req.params.id,
    });
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete category with ${productCount} products. Reassign products first.`,
        400
      );
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) throw new NotFoundError("Category");
    res.json({ success: true, message: "Category deleted" });
  }
);

// ──── Order Management ────
export const adminGetAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }
);

export const adminUpdateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new NotFoundError("Order");

    order.status = req.body.status;
    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    if (req.body.status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    if (req.body.status === "processing") {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    await order.save();

    res.json({ success: true, data: order });
  }
);

// ──── User Management ────
export const adminGetAllUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({})
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }
);

export const adminUpdateUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError("User");

    user.role = req.body.role;
    await user.save();

    res.json({
      success: true,
      data: { _id: user._id, name: user.name, role: user.role },
    });
  }
);

export const adminDeleteUser = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new NotFoundError("User");
    res.json({ success: true, message: "User deleted" });
  }
);

// ──── Review Moderation ────
export const adminGetAllReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({})
        .populate("user", "name email")
        .populate("product", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }
);

export const adminToggleReviewApproval = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await Review.findById(req.params.id);
    if (!review) throw new NotFoundError("Review");

    review.isApproved = !review.isApproved;
    await review.save();

    res.json({ success: true, data: review });
  }
);

export const adminDeleteReview = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) throw new NotFoundError("Review");
    res.json({ success: true, message: "Review deleted" });
  }
);

// ──── Coupon Management ────
export const adminGetAllCoupons = asyncHandler(
  async (_req: Request, res: Response) => {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: coupons });
  }
);

export const adminCreateCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase(),
    });
    res.status(201).json({ success: true, data: coupon });
  }
);

export const adminUpdateCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) throw new NotFoundError("Coupon");

    Object.assign(coupon, req.body);
    if (req.body.code) coupon.code = req.body.code.toUpperCase();
    const updated = await coupon.save();

    res.json({ success: true, data: updated });
  }
);

export const adminDeleteCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) throw new NotFoundError("Coupon");
    res.json({ success: true, message: "Coupon deleted" });
  }
);
