import type { Request, Response } from "express";
import Cart from "../models/Cart.model.js";
import Coupon from "../models/Coupon.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError, NotFoundError } from "../utils/AppError.js";

/** GET /api/v1/cart */
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  let cart = await Cart.findOne({ user: req.user?._id })
    .populate("items.product", "name price unit images mainImage inStock stockQuantity material")
    .populate("coupon")
    .lean();

  if (!cart) {
    cart = { user: req.user?._id, items: [], coupon: undefined } as unknown as typeof cart;
  }

  res.json({ success: true, data: cart });
});

/** POST /api/v1/cart/add */
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity = 1 } = req.body;

  let cart = await Cart.findOne({ user: req.user?._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user?._id,
      items: [{ product: productId, quantity }],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
  }

  const populated = await Cart.findById(cart._id)
    .populate("items.product", "name price unit images mainImage inStock stockQuantity material")
    .lean();

  res.json({ success: true, data: populated });
});

/** PUT /api/v1/cart/update */
export const updateCartItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      throw new NotFoundError("Cart");
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      throw new NotFoundError("Cart item");
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    const populated = await Cart.findById(cart._id)
      .populate("items.product", "name price unit images mainImage inStock stockQuantity material")
      .lean();

    res.json({ success: true, data: populated });
  }
);

/** DELETE /api/v1/cart/remove/:productId */
export const removeFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      throw new NotFoundError("Cart");
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();

    res.json({ success: true, message: "Item removed from cart" });
  }
);

/** DELETE /api/v1/cart/clear */
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await Cart.findOneAndUpdate(
    { user: req.user?._id },
    { items: [], coupon: undefined }
  );
  res.json({ success: true, message: "Cart cleared" });
});

/** POST /api/v1/cart/merge — merge guest cart items after login */
export const mergeGuestCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.json({ success: true, message: "No items to merge" });
      return;
    }

    let cart = await Cart.findOne({ user: req.user?._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user?._id,
        items: items.map((item: { productId: string; quantity: number }) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
      });
    } else {
      for (const guestItem of items as { productId: string; quantity: number }[]) {
        const existing = cart.items.find(
          (item) => item.product.toString() === guestItem.productId
        );
        if (existing) {
          existing.quantity = Math.max(existing.quantity, guestItem.quantity);
        } else {
          cart.items.push({
            product: guestItem.productId as unknown as import("mongoose").Types.ObjectId,
            quantity: guestItem.quantity,
          });
        }
      }
      await cart.save();
    }

    const populated = await Cart.findById(cart._id)
      .populate("items.product", "name price unit images mainImage inStock stockQuantity material")
      .lean();

    res.json({ success: true, data: populated });
  }
);

/** POST /api/v1/cart/apply-coupon */
export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, orderAmount } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new NotFoundError("Coupon");
  }

  if (coupon.expiryDate < new Date()) {
    throw new AppError("This coupon has expired", 400);
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError("This coupon has reached its usage limit", 400);
  }

  if (orderAmount < coupon.minOrderAmount) {
    throw new AppError(
      `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`,
      400
    );
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  // Update cart with coupon
  await Cart.findOneAndUpdate(
    { user: req.user?._id },
    { coupon: coupon._id }
  );

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount: Math.round(discount * 100) / 100,
    },
  });
});
