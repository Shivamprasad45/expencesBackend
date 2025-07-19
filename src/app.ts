import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import connectDB from "./config/db";
import dotenv from "dotenv";
import expenseRoutes from "./routes/expenseRoutes";
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/expenses", expenseRoutes);
// Connect Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
