import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    product: z.string().min(1, "Product ID is required"),
    rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
    comment: z.string().min(1, "Comment is required").max(1000),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().min(1).max(1000).optional(),
    isApproved: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});
