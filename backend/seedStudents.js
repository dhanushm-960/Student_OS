/**
 * seedStudents.js
 * Run to seed mock student users and profiles in MongoDB.
 * Usage: node seedStudents.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import StudentProfile from "./models/StudentProfile.js";

dotenv.config();

const DEPARTMENTS = ["CSE", "IT", "Electronics", "Mechanical", "Civil"];
const RISK_LEVELS = ["Low", "Medium", "High"];

// Realistic student names
const MOCK_NAMES = [
  "Aryan Kapoor", "Sneha Iyer", "Rohan Verma", "Priya Suresh", "Karan Singh",
  "Nisha Patel", "Amit Sharma", "Deepika Rao", "Siddharth Sharma", "Ananya Reddy",
  "Aditya Gupta", "Meera Krishnan", "Rahul Nair", "Neha Joshi", "Varun Dhawan",
  "Pooja Hegde", "Arjun Kapoor", "Shruti Hassan", "Gaurav Sen", "Tanvi Shah",
  "Vikram Malhotra", "Kriti Sanon", "Rishabh Pant", "Ishaan Kishan", "Shreya Ghoshal",
  "Arijit Singh", "Sunidhi Chauhan", "Armaan Malik", "Alia Bhatt", "Ranbir Kapoor",
  "Kiara Advani", "Sidharth Malhotra", "Katrina Kaif", "Vicky Kaushal", "Deepika Padukone",
  "Ranveer Singh", "Priyanka Chopra", "Nick Jonas", "Anushka Sharma", "Virat Kohli",
  "Rohit Sharma", "K L Rahul", "Hardik Pandya", "Jasprit Bumrah", "Ravindra Jadeja",
  "R Ashwin", "Yuzvendra Chahal", "Shikhar Dhawan", "Shreyas Iyer", "Rishabh Iyer"
];

const RECOMMENDATIONS = [
  "Complete DSA practice problems daily — target 5 LeetCode problems/week",
  "Attendance below threshold — schedule advisor meeting immediately",
  "Enroll in at least 2 more projects to strengthen portfolio",
  "Excellent placement readiness — apply for dream company roles now",
  "Participate in upcoming mock interview sessions this Friday",
  "Revise Database Management Systems concepts for upcoming interview rounds",
  "Update GitHub profile with details of the capstone project",
  "Schedule a resume review session with the placement coordinator",
  "Improve presentation skills by participating in college technical talks",
  "Engage with system design materials; read white papers on microservices"
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB for seeding students.");

    // 1. Clean existing students
    // Find all users with role 'student'
    const studentUsers = await User.find({ role: "student" });
    const studentUserIds = studentUsers.map(u => u._id);
    
    // Delete their student profiles
    const deletedProfiles = await StudentProfile.deleteMany({ user: { $in: studentUserIds } });
    console.log(`🧹 Deleted ${deletedProfiles.deletedCount} existing student profiles.`);

    // Delete the student users
    const deletedUsers = await User.deleteMany({ role: "student" });
    console.log(`🧹 Deleted ${deletedUsers.deletedCount} existing student users.`);

    // 2. Hash a common password
    const hashedPassword = await bcrypt.hash("Student@123", 10);

    // 3. Generate student records
    const studentsToCreate = [];
    const profilesToCreate = [];

    for (let i = 0; i < MOCK_NAMES.length; i++) {
      const name = MOCK_NAMES[i];
      const firstName = name.split(" ")[0].toLowerCase();
      const lastName = name.split(" ")[1].toLowerCase();
      
      // Email ends in @atria.edu to pass frontend validations
      const email = `${firstName}.${lastName}${10 + i}@atria.edu`;

      // Create student User object
      const studentUser = new User({
        name,
        email,
        password: hashedPassword,
        role: "student"
      });

      studentsToCreate.push(studentUser);

      // Determine department
      const department = DEPARTMENTS[i % DEPARTMENTS.length];
      const rollNumber = `${department}21${String(100 + i).slice(1)}`;
      const year = (i % 4) + 1; // Years 1 to 4

      // Generate realistic stats
      let gpa = parseFloat((7.0 + Math.random() * 2.8).toFixed(2)); // GPA between 7.0 and 9.8
      let attendance = Math.floor(65 + Math.random() * 32); // Attendance between 65% and 97%
      let dsaProgress = Math.floor(40 + Math.random() * 58); // DSA between 40% and 98%
      let projectsCompleted = Math.floor(1 + Math.random() * 8); // Projects 1 to 8
      let placementReadiness = Math.floor(40 + Math.random() * 58); // Placement Readiness between 40% and 98%
      let goalProgress = Math.floor(50 + Math.random() * 48); // Goal progress between 50% and 98%

      // Determine risk level based on GPA and attendance
      let riskLevel = "Low";
      if (attendance < 75 || gpa < 7.2) {
        riskLevel = "High";
      } else if (attendance < 85 || gpa < 8.0) {
        riskLevel = "Medium";
      }

      // Generate AI Recommendations
      const aiRecs = [];
      if (dsaProgress < 70) aiRecs.push(RECOMMENDATIONS[0]);
      if (attendance < 75) aiRecs.push(RECOMMENDATIONS[1]);
      if (projectsCompleted < 4) aiRecs.push(RECOMMENDATIONS[2]);
      if (placementReadiness > 80) aiRecs.push(RECOMMENDATIONS[3]);
      
      // Add random general recommendations
      aiRecs.push(RECOMMENDATIONS[4]);
      const extraRecIdx = 5 + (i % 5);
      aiRecs.push(RECOMMENDATIONS[extraRecIdx]);

      const profile = new StudentProfile({
        user: studentUser._id,
        rollNumber,
        department,
        year,
        gpa,
        attendance,
        dsaProgress,
        projectsCompleted,
        placementReadiness,
        goalProgress,
        riskLevel,
        aiRecommendations: aiRecs
      });

      profilesToCreate.push(profile);
    }

    // Insert all to DB
    const createdUsers = await User.insertMany(studentsToCreate);
    const createdProfiles = await StudentProfile.insertMany(profilesToCreate);

    console.log(`🎉 Seeded ${createdUsers.length} student users.`);
    console.log(`🎉 Seeded ${createdProfiles.length} student profiles.`);
    console.log("   Default Student Password: Student@123");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
