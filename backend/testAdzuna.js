import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { syncMarketData } from "./services/careerPulseService.js";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
    
    console.log("Triggering live market data sync...");
    const summaries = await syncMarketData();
    console.log("Result:", JSON.stringify(summaries, null, 2));
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
