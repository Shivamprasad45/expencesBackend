import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import connectDB from "./config/db";
import dotenv from "dotenv";
import expenseRoutes from "./routes/expenseRoutes";
import premiumRoutes from "./routes/Premiume.route";
dotenv.config();

import paymentRoutes from "./routes/payments.routes";
const app = express();

// Middleware
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "https://expences-tracker-f.vercel.app"],
  })
);
app.use("/api/expenses", expenseRoutes);

// Connect Database
connectDB();
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

app.use("/api/premium", premiumRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
