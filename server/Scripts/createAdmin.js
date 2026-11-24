import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import Admin from "../models/Admin.js";

dotenv.config();

const rl = readline.createInterface({ input, output });

async function createAdmin() {
  try {
    const username = (await rl.question("Enter admin username: "))
      .trim()
      .toLowerCase();

    const password = await rl.question("Enter admin password: ");

    if (!username || !password || password.length < 12) {
      throw new Error(
        "Username is required and password must be at least 12 characters.",
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      console.log("This administrator username already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Admin.create({
      username,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Administrator account created successfully!");
  } catch (error) {
    console.error("Admin setup error:", error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

createAdmin();
