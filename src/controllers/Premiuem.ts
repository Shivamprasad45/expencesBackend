import Expense from "../models/Expense";
import { Request, Response } from "express";
import mongoose from "mongoose";

interface LeaderboardEntry {
  _id: string;
  totalAmount: number;
  totalExpenses: number;
  name: string;
  email: string;
}

export const exportLeaderboard = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const leaderboard = await Expense.aggregate([
      // Filter out any documents with invalid userId
      { $match: { userId: { $exists: true, $ne: null } } },

      // Clean and convert userId string to ObjectId for proper lookup
      {
        $addFields: {
          cleanUserId: {
            $trim: {
              input: {
                $replaceAll: {
                  input: "$userId",
                  find: ":",
                  replacement: "",
                },
              },
              chars: " :",
            },
          },
        },
      },
      {
        $addFields: {
          userObjectId: {
            $cond: {
              if: { $eq: [{ $strLenCP: "$cleanUserId" }, 24] },
              then: { $toObjectId: "$cleanUserId" },
              else: null,
            },
          },
        },
      },
      // Filter out documents where conversion failed
      { $match: { userObjectId: { $ne: null } } },

      // Group by userId to calculate totals
      {
        $group: {
          _id: "$userObjectId", // Use the converted ObjectId
          totalAmount: { $sum: "$amount" },
          totalExpenses: { $sum: 1 },
        },
      },

      // Lookup user details from the User collection
      {
        $lookup: {
          from: "users", // Collection name in MongoDB (usually lowercase plural)
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },

      // Unwind the userDetails array
      { $unwind: "$userDetails" },

      // Project the desired fields
      {
        $project: {
          _id: 0,
          userId: "$_id",
          totalAmount: 1,
          totalExpenses: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
        },
      },

      // Sort by total amount descending
      { $sort: { totalAmount: -1 } },
    ]);

    console.log("Leaderboard data:", leaderboard);

    if (!leaderboard.length) {
      return res
        .status(404)
        .json({ message: "No expenses found for leaderboard" });
    }

    return res.json(leaderboard);
  } catch (error: any) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({ message: error.message });
  }
};
