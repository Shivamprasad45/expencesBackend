"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentControllers_1 = require("../controllers/paymentControllers");
// import { createOrder, verifyPayment } from '../controllers/payment.controller';
// import authMiddleware from '../middleware/auth.middleware';
const router = express_1.default.Router();
router.post("/create-order", paymentControllers_1.createOrder);
router.post("/verify", paymentControllers_1.verifyPayment);
exports.default = router;
