import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentControllers";
// import { createOrder, verifyPayment } from '../controllers/payment.controller';
// import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

export default router;
