"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPremium = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const checkPremium = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("Checking premium status for user");
        console.log(authHeader);
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        const user = await User_1.default.findById(decoded.id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (!user.isPremium) {
            return res.status(403).json({ message: "Access denied: Premium only" });
        }
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(403).json({ message: "Access denied" });
    }
};
exports.checkPremium = checkPremium;
