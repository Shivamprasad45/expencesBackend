import express from "express";
import {
  createExpense,
  getExpenses,
  getExpense,
  // updateExpense,
  deleteExpense,
  getExpenseStats,
  createAIExpense,
} from "../controllers/expenseController";
import { authMiddleware } from "../middleware/auth";
// import authMiddleware from "../middleware/auth";

const router = express.Router();

// router.use(authMiddleware);

router.post("/", authMiddleware, createExpense);
router.post("/gemini-expense/:user", authMiddleware, createAIExpense);
router.get("/:user", authMiddleware, getExpenses);
router.get("/stats/:id", authMiddleware, getExpenseStats);
router.get("/Users/:id", authMiddleware, getExpense);
// router.put("/:id", updateExpense);
router.delete("/:id", authMiddleware, deleteExpense);

export default router;
