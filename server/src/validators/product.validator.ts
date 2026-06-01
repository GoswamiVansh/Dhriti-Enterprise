import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required"),
    material: z.string().min(1, "Material is required"),
    price: z.number().min(0, "Price must be positive"),
    originalPrice: z.number().min(0).optional(),
    unit: z.string().min(1, "Unit is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(1, "Description is required"),
    inStock: z.boolean().optional(),
    stockQuantity: z.number().min(0).optional(),
    isFeatured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    material: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    originalPrice: z.number().min(0).optional(),
    unit: z.string().min(1).optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    inStock: z.boolean().optional(),
    stockQuantity: z.number().min(0).optional(),
    isFeatured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    mainImage: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
    category: z.string().optional(),
    material: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    inStock: z.string().optional(),
    search: z.string().optional(),
    featured: z.string().optional(),
  }),
});
