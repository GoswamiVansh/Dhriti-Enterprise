import { Router } from "express";
import {
  getProducts,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

export default router;
