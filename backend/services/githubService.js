import axios from "axios";

/**
 * Extracts username from a github URL
 * e.g., https://github.com/dhanushm-960 -> dhanushm-960
 */
export const extractGithubUsername = (url) => {
  if (!url) return null;
  
  try {
    // Handle formats like "github.com/username", "https://github.com/username", "www.github.com/username/"
    let cleanUrl = url.trim().toLowerCase();
    if (!cleanUrl.startsWith("http")) {
      cleanUrl = "https://" + cleanUrl;
    }
    const parsed = new URL(cleanUrl);
    if (parsed.hostname.includes("github.com")) {
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      if (pathParts.length > 0) {
        return pathParts[0];
      }
    }
  } catch (error) {
    // If URL parsing fails, fallback to simple regex
    const match = url.match(/github\.com\/([^\/]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

/**
 * Fetches user profile and repos to generate stats
 */
export const fetchGithubStats = async (githubUrl) => {
  const username = extractGithubUsername(githubUrl);
  if (!username) return null;

  try {
    const headers = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "StudentOS-App"
    };

    // If PAT is provided, use it (increases rate limit from 60 to 5000 / hr)
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
    }

    console.log(`\uD83D\uDD0D [GitHub Service] Fetching stats for user: ${username}`);

    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers }).catch(() => null),
      axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }).catch(() => null)
    ]);

    if (!userRes || !userRes.data) return null;

    const repos = reposRes?.data || [];
    
    // Calculate total stars
    const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
    
    // Calculate top languages
    const langCounts = {};
    repos.forEach(repo => {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    return {
      username,
      reposCount: userRes.data.public_repos || repos.length,
      followers: userRes.data.followers || 0,
      totalStars,
      topLanguages
    };
  } catch (error) {
    console.error(`\u274C [GitHub Service] Failed to fetch stats for ${username}:`, error.message);
    return null;
  }
};
