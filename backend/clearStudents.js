import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import StudentProfile from "./models/StudentProfile.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB.");

    // Find all student users
    const studentUsers = await User.find({ role: "student" });
    const ids = studentUsers.map(u => u._id);

    // Delete their student profiles
    const profDel = await StudentProfile.deleteMany({ user: { $in: ids } });
    
    // Delete the student users
    const userDel = await User.deleteMany({ role: "student" });

    console.log(`🧹 Deleted ${profDel.deletedCount} student profiles.`);
    console.log(`🧹 Deleted ${userDel.deletedCount} student users.`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to clear students:", error.message);
    process.exit(1);
  }
}

run();
