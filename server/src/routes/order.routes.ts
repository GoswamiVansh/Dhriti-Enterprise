import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { createOrderSchema } from "../validators/order.validator.js";

const router = Router();

router.use(protect);

router.post("/", validate(createOrderSchema), createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);

export default router;
