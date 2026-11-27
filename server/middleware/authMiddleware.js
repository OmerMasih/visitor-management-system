import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// ==========================================
// AUTHENTICATE ANY LOGGED-IN USER
// ==========================================
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check that the account still exists and get its current role
    const user = await Admin.findById(decoded.id).select("_id username role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account not found. Please log in again.",
      });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    // Preserve compatibility with existing backend code
    req.admin = req.user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session. Please log in again.",
    });
  }
};

// ==========================================
// ADMINISTRATOR-ONLY ACCESS
// ==========================================
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Administrator access required.",
    });
  }

  next();
};

// Default middleware remains administrator-only
const authMiddleware = [authenticateUser, requireAdmin];

export default authMiddleware;
