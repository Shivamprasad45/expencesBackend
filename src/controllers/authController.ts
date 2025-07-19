import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/emailSender";
// Generate token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = (await User.create({
      name,
      email,
      password,
    })) as typeof User.prototype;

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = (await User.findOne({ email })) as typeof User.prototype & {
      _id: any;
      name: string;
      email: string;
      matchPassword: (password: string) => Promise<boolean>;
    };

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    // req.user will be set by our auth middleware
    const user = await User.findById((req as any).user._id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log("ok");
  console.log(email, "sddsds");
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set reset token and expiration
    user.resetPasswordToken = crypto
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

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: message,
    });

    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
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
    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful",
      html: `<p>Your password has been successfully reset.</p>`,
    });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
