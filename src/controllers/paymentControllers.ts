import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, currency = "INR", userId } = req.body;
    console.log(
      "Creating order with amount:",
      amount,
      "and currency:",
      currency
    );
    const options = {
      amount: amount, // amount in smallest currency unit (paise)
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment order",
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, userId } =
      req.body;

    // Create the expected signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    // Validate signature
    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        error: "Payment verification failed",
      });
    }

    // Update user to premium
    await User.findByIdAndUpdate(userId, {
      $set: { isPremium: true, premiumSince: new Date() },
    });

    res.status(200).json({
      success: true,
      message: "Payment verified and user upgraded to premium",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify payment",
    });
  }
};
