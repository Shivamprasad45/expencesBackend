"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportLeaderboard = void 0;
const Expense_1 = __importDefault(require("../models/Expense"));
const exportLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Expense_1.default.aggregate([
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
    }
    catch (error) {
        console.error("Leaderboard error:", error);
        return res.status(500).json({ message: error.message });
    }
};
exports.exportLeaderboard = exportLeaderboard;
