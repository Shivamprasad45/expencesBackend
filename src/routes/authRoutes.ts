// src/routes/authRoutes.ts
import { Router } from "express";
import {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", getProfile);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;
