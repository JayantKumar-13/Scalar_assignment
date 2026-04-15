import { Router } from "express";
import {
  createOrder,
  getOrderByNumber,
  getOrders
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", getOrders);
router.get("/:orderNumber", getOrderByNumber);
router.post("/", createOrder);

export default router;

