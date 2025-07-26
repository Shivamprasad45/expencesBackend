"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expenseController_1 = require("../controllers/expenseController");
const auth_1 = require("../middleware/auth");
// import authMiddleware from "../middleware/auth";
const router = express_1.default.Router();
// router.use(authMiddleware);
router.post("/", auth_1.authMiddleware, expenseController_1.createExpense);
router.post("/gemini-expense/:user", auth_1.authMiddleware, expenseController_1.createAIExpense);
router.get("/:user", auth_1.authMiddleware, expenseController_1.getExpenses);
router.get("/stats/:id", auth_1.authMiddleware, expenseController_1.getExpenseStats);
router.get("/Users/:id", auth_1.authMiddleware, expenseController_1.getExpense);
// router.put("/:id", updateExpense);
router.delete("/:id", auth_1.authMiddleware, expenseController_1.deleteExpense);
exports.default = router;
