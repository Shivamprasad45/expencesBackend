"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
router.get("/profile", authController_1.getProfile);
router.post("/forgot-password", authController_1.forgotPassword);
router.put("/reset-password/:token", authController_1.resetPassword);
exports.default = router;
