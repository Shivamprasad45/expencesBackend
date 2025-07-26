import jwt from "jsonwebtoken";
import User from "../models/User";
import { Request, Response, NextFunction } from "express";

export const checkPremium = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("Checking premium status for user");
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Decoded token:", decoded);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isPremium) {
      return res.status(403).json({ message: "Access denied: Premium only" });
    }

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Access denied" });
  }
};
