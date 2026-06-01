import { z } from "zod";

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3, "Coupon code must be at least 3 characters"),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number().min(0, "Discount value must be positive"),
    minOrderAmount: z.number().min(0).default(0),
    maxDiscount: z.number().min(0).optional(),
    expiryDate: z.string().min(1, "Expiry date is required"),
    isActive: z.boolean().default(true),
    usageLimit: z.number().min(0).default(0),
  }),
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Coupon code is required"),
    orderAmount: z.number().min(0),
  }),
});
