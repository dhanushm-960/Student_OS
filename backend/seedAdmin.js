/**
 * seedAdmin.js
 * Run once to create the initial Super Admin account in MongoDB.
 * Usage: node seedAdmin.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config();

const ADMIN_NAME = "Super Admin";
const ADMIN_EMAIL = "admin@studentos.com";
const ADMIN_PASSWORD = "Admin@1234";

// Inline User schema (matches models/User.js)
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB:", process.env.MONGO_URI);

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    console.log("🎉 Admin account created successfully!");
    console.log("   Email   :", ADMIN_EMAIL);
    console.log("   Password:", ADMIN_PASSWORD);
    console.log("   Role    : admin");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
