import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { syncMarketData, updateStudentInsights } from './services/careerPulseService.js';

dotenv.config();

const run = async () => {
  await connectDB();
  console.log("Database connected. Triggering sync...");
  await syncMarketData();
  await updateStudentInsights();
  console.log("Done.");
  process.exit(0);
};

run();
