import axios from "axios";
import { z } from "zod";

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

// Schema for individual job results from Adzuna
const adzunaJobSchema = z.object({
  title: z.string().optional().nullable(),
  company: z.object({ display_name: z.string().optional().nullable() }).optional().nullable(),
  description: z.string().optional().nullable(),
  salary_min: z.number().optional().nullable(),
  salary_max: z.number().optional().nullable(),
  category: z.object({ tag: z.string().optional().nullable() }).optional().nullable(),
});

// Response schema containing results array
const adzunaResponseSchema = z.object({
  results: z.array(adzunaJobSchema).default([]),
});

const ROLES_TO_QUERY = [
  "software engineer",
  "data analyst",
  "frontend developer",
  "backend developer",
  "devops engineer"
];

// Helper to fetch with retry
const fetchWithRetry = async (url, params, retries = 1) => {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    if (retries > 0) {
      console.warn(`⚠️ [AdzunaService] Fetch failed, retrying... (${retries} retries left)`);
      return fetchWithRetry(url, params, retries - 1);
    }
    throw new Error(`Adzuna API request failed: ${error.message}`);
  }
};

/**
 * Fetches and aggregates jobs from Adzuna for a specific location.
 * @param {string} location - The city/location to search within India.
 * @returns {Array} - Array of validated job objects.
 */
export const fetchAdzunaJobs = async (location) => {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    throw new Error("Missing Adzuna API credentials in environment variables.");
  }

  const allJobs = [];

  for (const role of ROLES_TO_QUERY) {
    console.log(`📡 [AdzunaService] Fetching "${role}" jobs in ${location}...`);
    try {
      const data = await fetchWithRetry(`https://api.adzuna.com/v1/api/jobs/in/search/1`, {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_APP_KEY,
        what: role,
        where: location,
        results_per_page: 50 // Fetch up to 50 jobs per role
      });

      // Validate response using Zod
      const parsedData = adzunaResponseSchema.parse(data);
      if (parsedData.results && parsedData.results.length > 0) {
        allJobs.push(...parsedData.results);
      }
    } catch (error) {
      console.error(`❌ [AdzunaService] Error fetching "${role}" in ${location}:`, error.message);
      // We don't throw here so we can still return partial results for other roles
    }
  }

  return allJobs;
};
