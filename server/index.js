import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import visitorRoutes from "./routes/visitorRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL].filter(
  Boolean,
);

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/visitors", visitorRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Visitor Management System API is running!");
});

// Test API route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Visitor Management System API!",
  });
});

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
