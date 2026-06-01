import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          product: z.string().min(1),
          name: z.string().min(1),
          price: z.number().min(0),
          quantity: z.number().min(1),
          unit: z.string().min(1),
          image: z.string().default(""),
        })
      )
      .min(1, "At least one item is required"),
    shippingAddress: z.object({
      fullName: z.string().min(1, "Full name is required"),
      street: z.string().min(1, "Street is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      zipCode: z.string().min(1, "Zip code is required"),
      country: z.string().default("India"),
      phone: z.string().min(1, "Phone is required"),
    }),
    paymentMethod: z.string().default("Cash on Delivery"),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]),
    trackingNumber: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});
