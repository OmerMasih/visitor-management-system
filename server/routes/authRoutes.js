import express from "express";
import mongoose from "mongoose";
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
    // Prevent deactivated accounts from logging in
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated. Contact your administrator.",
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

// ==========================================
// GET ALL EMPLOYEE ACCOUNTS
// ADMIN ONLY
// ==========================================
router.get("/employees", authMiddleware, async (req, res) => {
  try {
    const employees = await Admin.find({ role: "employee" })
      .select("_id username role isActive createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve employee accounts.",
    });
  }
});

// ==========================================
// ACTIVATE OR DEACTIVATE EMPLOYEE
// ADMIN ONLY
// ==========================================
router.patch("/employees/:id/status", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "A valid account status is required.",
      });
    }

    const employee = await Admin.findOneAndUpdate(
      { _id: id, role: "employee" },
      { $set: { isActive } },
      { returnDocument: "after", runValidators: true },
    ).select("_id username role isActive");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Employee account activated successfully."
        : "Employee account deactivated successfully.",
      employee,
    });
  } catch (error) {
    console.error("Update employee status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update employee account status.",
    });
  }
});

// ==========================================
// RESET EMPLOYEE PASSWORD
// ADMIN ONLY
// ==========================================
router.patch(
  "/employees/:id/reset-password",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee ID.",
        });
      }

      if (!newPassword || newPassword.length < 12) {
        return res.status(400).json({
          success: false,
          message: "Password must contain at least 12 characters.",
        });
      }

      const employee = await Admin.findOne({
        _id: id,
        role: "employee",
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee account not found.",
        });
      }

      employee.password = await bcrypt.hash(newPassword, 12);
      await employee.save();

      return res.status(200).json({
        success: true,
        message: "Employee password reset successfully.",
      });
    } catch (error) {
      console.error("Reset employee password error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to reset employee password.",
      });
    }
  },
);

export default router;
