"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.getProfile = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const emailSender_1 = require("../utils/emailSender");
// Generate token
const generateToken = (id, isPremium) => {
    return jsonwebtoken_1.default.sign({ id, isPremium }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};
// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = (await User_1.default.create({
            name,
            email,
            password,
        }));
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id.toString(), user.isPremium),
            });
        }
        else {
            res.status(400).json({ message: "Invalid user data" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.register = register;
// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = (await User_1.default.findOne({ email }));
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id.toString(), user.isPremium),
                isPremium: user.isPremium,
            });
        }
        else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.login = login;
// @desc    Get user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
    try {
        // req.user will be set by our auth middleware
        const user = await User_1.default.findById(req.user._id).select("-password");
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getProfile = getProfile;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(20).toString("hex");
        // Set reset token and expiration
        user.resetPasswordToken = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();
        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        // Send email
        const message = `
      <h1>You requested a password reset</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
    `;
        await (0, emailSender_1.sendEmail)({
            to: user.email,
            subject: "Password Reset Request",
            html: message,
        });
        res.json({ message: "Email sent successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const user = await User_1.default.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        // Send confirmation email
        await (0, emailSender_1.sendEmail)({
            to: user.email,
            subject: "Password Reset Successful",
            html: `<p>Your password has been successfully reset.</p>`,
        });
        res.json({ message: "Password reset successful" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.resetPassword = resetPassword;
