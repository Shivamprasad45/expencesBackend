import { Request, Response } from "express";
import Expense, { IExpense } from "../models/Expense";

interface ExpenseFilters {
  category?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  paymentMethod?: string;
  search?: string;
}

import { GoogleGenerativeAI } from "@google/generative-ai";
// adjust path to your model

const genAI = new GoogleGenerativeAI("AIzaSyAj15XI7h97dinskxV2D_EdeiyWzwgGwnk");

export const createAIExpense = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const userId = req.params.user;

    if (!text || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expense extractor. Convert this user input into a structured JSON with fields like "title", "amount", "category", "date", "description", "paymentMethod", "isRecurring", "tags".

If any field is missing or unknown, leave it empty (e.g. "") and we will handle it.

Input: "${text}"

Output:
{
  "title": string,
  "amount": number,
  "category": string,
  "date": string,
  "description": string,
  "paymentMethod": string,
  "isRecurring": boolean,
  "tags": string[]
}
`;

    const result = await model.generateContent(prompt);
    const output = result.response.text().trim();

    // Clean and parse the JSON
    const clean = output.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Enrich missing fields with default values
    const enriched = {
      title: parsed.title || "Unknown Expense",
      amount: parsed.amount || 0,
      category: parsed.category || "Miscellaneous",
      date: parsed.date || new Date().toISOString().split("T")[0],
      description: parsed.description || "No description provided.",
      paymentMethod: parsed.paymentMethod || "Cash",
      isRecurring:
        typeof parsed.isRecurring === "boolean" ? parsed.isRecurring : false,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      userId,
    };

    const expense: IExpense = new Expense(enriched);
    await expense.save();

    res.status(201).json(expense);
  } catch (error: any) {
    console.error("AI Expense Creation Failed:", error);
    res.status(500).json({ message: "Failed to create AI expense" });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const expense: IExpense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  console.log("Fetching expenses with filters:", req.query);
  const userId = req.params.user;

  try {
    const filters: ExpenseFilters = req.query;
    let query: any = { userId }; // ✅ Fixed: start with userId as an object
    console.log(query, "Query for expenses");

    // Apply filters
    if (filters.category) query.category = filters.category;
    if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { tags: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.amountMin)
      query.amount = { ...query.amount, $gte: Number(filters.amountMin) };

    if (filters.amountMax)
      query.amount = { ...query.amount, $lte: Number(filters.amountMax) };

    if (filters.dateFrom || filters.dateTo) {
      query.date = {};
      if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpense = async (req: Request, res: Response) => {
  const userId = req.params.id;
  console.log("userId:", userId);
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const expenses = await Expense.find({ userId });
    console.log(expenses, " Expenses found for user");
    if (expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found" });
    }

    console.log(expenses, " Expense(s) found");
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
    });

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpenseStats = async (req: Request, res: Response) => {
  try {
    const userId = req.params?.id;
    console.log(userId, " User ID for stats");
    // Total expenses and amount
    const totalAggregation = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const { totalExpenses = 0, totalAmount = 0 } = totalAggregation[0] || {};
    const averageExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

    // Category spending
    const categorySpending = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
        },
      },
      { $project: { category: "$_id", amount: 1, _id: 0 } },
    ]);

    // Payment method distribution
    const paymentDistribution = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$paymentMethod",
          amount: { $sum: "$amount" },
        },
      },
      { $project: { method: "$_id", amount: 1, _id: 0 } },
    ]);

    // Monthly spending (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpending = await Expense.aggregate([
      { $match: { userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: "$_id",
          amount: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Top categories
    const topCategories = [...categorySpending]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        percentage: (item.amount / totalAmount) * 100,
      }));

    // Budget status (mock implementation - you'll need to implement budgets)
    const budgetStatus = {
      totalBudget: 2000,
      spent: totalAmount,
      remaining: 2000 - totalAmount,
      percentage: (totalAmount / 2000) * 100,
    };

    res.json({
      totalExpenses,
      totalAmount,
      averageExpense,
      categoriesSpending: Object.fromEntries(
        categorySpending.map((item) => [item.category, item.amount])
      ),
      monthlySpending,
      paymentMethodDistribution: Object.fromEntries(
        paymentDistribution.map((item) => [item.method, item.amount])
      ),
      topCategories,
      budgetStatus,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
