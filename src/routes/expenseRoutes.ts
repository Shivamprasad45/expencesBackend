import express from "express";
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
} from "../controllers/expenseController";
import { authMiddleware } from "../middleware/auth";
// import authMiddleware from "../middleware/auth";

const router = express.Router();

// router.use(authMiddleware);

router.post("/", createExpense);
router.get("/:user", getExpenses);
router.get("/stats/:id", getExpenseStats);
router.get("/Users/:id", getExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
