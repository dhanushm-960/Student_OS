import cron from "node-cron";
import { syncMarketData, updateStudentInsights } from "../services/careerPulseService.js";

// Run every night at midnight (0 0 * * *)
export const initMarketCron = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ [MarketCron] Starting Nightly Market Intelligence Sync...");
    try {
      await syncMarketData();
      await updateStudentInsights();
      console.log("✅ [MarketCron] Nightly Market Intelligence Sync Completed.");
    } catch (error) {
      console.error("❌ [MarketCron] Nightly Sync Failed:", error);
    }
  });
  console.log("📅 [MarketCron] Nightly sync job scheduled (runs at midnight).");
};
