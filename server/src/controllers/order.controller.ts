import type { Request, Response } from "express";
import Order from "../models/Order.model.js";
import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError, NotFoundError } from "../utils/AppError.js";

/** POST /api/v1/orders */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { items, shippingAddress, paymentMethod = "Cash on Delivery" } = req.body;

  if (!items || items.length === 0) {
    throw new AppError("No order items", 400);
  }

  // Calculate prices
  const itemsPrice = items.reduce(
    (acc: number, item: { price: number; quantity: number }) =>
      acc + item.price * item.quantity,
    0
  );

  const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100; // 18% GST
  const shippingPrice = itemsPrice >= 4999 ? 0 : 99; // Free delivery above ₹4999
  const totalPrice =
    Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

  const order = await Order.create({
    user: req.user?._id,
    items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: paymentMethod === "Cash on Delivery" ? false : false,
    status: "pending",
  });

  // Clear user's cart after order
  if (req.user?._id) {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], coupon: undefined }
    );
  }

  // Update stock quantities
  for (const item of items as { product: string; quantity: number }[]) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stockQuantity: -item.quantity },
    });
  }

  res.status(201).json({ success: true, data: order });
});

/** GET /api/v1/orders/my-orders */
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user?._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: orders });
});

/** GET /api/v1/orders/:id */
export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .lean();

    if (!order) {
      throw new NotFoundError("Order");
    }

    // Ensure user can only view their own orders (unless admin)
    if (
      req.user?.role !== "admin" &&
      order.user &&
      order.user._id?.toString() !== req.user?._id
    ) {
      throw new AppError("Not authorized to view this order", 403);
    }

    res.json({ success: true, data: order });
  }
);
