import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// LOGIN - ADMIN AND EMPLOYEE
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const user = await Admin.findOne({
      username: username.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
});

// ==========================================
// CHANGE ADMIN PASSWORD
// ADMIN ONLY
// ==========================================
router.patch("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 12 characters.",
      });
    }

    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Administrator account not found.",
      });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Your current password is incorrect.",
      });
    }

    const samePassword = await bcrypt.compare(newPassword, admin.password);

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "Please choose a different password.",
      });
    }

    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password.",
    });
  }
});

// ==========================================
// CREATE EMPLOYEE ACCOUNT
// ADMIN ONLY
// ==========================================
router.post("/create-admin", authMiddleware, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 30 characters.",
      });
    }

    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Username can contain letters, numbers, dots, underscores, and hyphens only.",
      });
    }

    if (password.length < 12) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 12 characters.",
      });
    }

    const existingUser = await Admin.findOne({
      username: cleanUsername,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This username is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newEmployee = await Admin.create({
      username: cleanUsername,
      password: hashedPassword,
      role: "employee",
    });

    return res.status(201).json({
      success: true,
      message: "Employee account created successfully.",
      user: {
        id: newEmployee._id,
        username: newEmployee.username,
        role: newEmployee.role,
      },
    });
  } catch (error) {
    console.error("Create employee error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This username is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create employee account.",
    });
  }
});

export default router;
