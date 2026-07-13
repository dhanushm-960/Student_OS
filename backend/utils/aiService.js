import dotenv from "dotenv";

dotenv.config();

/**
 * Sends a generation request to the Gemini API.
 * 
 * @param {string} systemPrompt Persona and system constraints
 * @param {string} userPrompt The main user query / instruction
 * @param {Array} history Conversation history
 * @returns {Promise<string|null>} The generated text response or null if failed
 */
const callGemini = async (systemPrompt, userPrompt, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const messages = [];

    // Map history to Gemini format
    // Gemini roles: "user" or "model"
    history.forEach(msg => {
      messages.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }]
      });
    });

    // Append latest prompt
    messages.push({
      role: "user",
      parts: [{ text: userPrompt }]
    });

    console.log(`📡 [AI Service] Calling Google Gemini API with ${messages.length} content nodes...`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ [AI Service] Gemini API error: ${response.status} - ${errText}`);
      return null;
    }

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return resultText ? resultText.trim() : null;
  } catch (error) {
    console.error("❌ [AI Service] Exception during Gemini fetch:", error);
    return null;
  }
};

/**
 * Sends a generation request to the OpenAI API.
 *
 * @param {string} systemPrompt Persona and system constraints
 * @param {string} userPrompt The main user query / instruction
 * @param {Array} history Conversation history
 * @returns {Promise<string|null>} The generated text response or null if failed
 */
const callOpenAI = async (systemPrompt, userPrompt, history = []) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const messages = [
      { role: "system", content: systemPrompt }
    ];

    history.forEach(msg => {
      messages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.text
      });
    });

    messages.push({ role: "user", content: userPrompt });

    console.log(`📡 [AI Service] Calling OpenAI API as fallback model...`);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ [AI Service] OpenAI API error: ${response.status} - ${errText}`);
      return null;
    }

    const data = await response.json();
    const resultText = data?.choices?.[0]?.message?.content;
    return resultText ? resultText.trim() : null;
  } catch (error) {
    console.error("❌ [AI Service] Exception during OpenAI fetch:", error);
    return null;
  }
};

/**
 * Dispatches the prompt to Gemini (primary) or OpenAI (fallback).
 */
const generateResponse = async (systemPrompt, userPrompt, history = []) => {
  // 1. Try Google Gemini API
  let response = await callGemini(systemPrompt, userPrompt, history);
  if (response) return response;

  // 2. Try OpenAI API as fallback
  response = await callOpenAI(systemPrompt, userPrompt, history);
  if (response) return response;

  return null;
};

// Safe JSON parser utility that cleans markdown backticks
function parseJSON(text) {
  if (!text) return null;
  try {
    const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("❌ [AI Service] JSON parsing failed for raw output:", text);
    return null;
  }
}

// ──────────────────────────────────────────────────────────────
// EXPOSED MODULAR INTERFACES
// ──────────────────────────────────────────────────────────────

/**
 * 1. Generate Placement Recommendations Card
 */
export const generateRecommendation = async (studentContext) => {
  const profile = studentContext.studentProfile;
  const systemPrompt = `You are the StudentOS AI Placement Analyst. Based on the student's metrics, find the top 3 gaps and assign impact boosts.
Return ONLY a valid JSON object matching this structure:
{
  "predictedAfterCompletion": 85,
  "recommendations": [
    {
      "title": "Action title (e.g. Complete a portfolio Project)",
      "explanation": "Brief explanation mapping back to matching companies requirements or career goals",
      "impact": 6
    }
  ]
}
Do not write any other text or formatting. Just JSON.`;

  const userPrompt = `Student Context:
- Name: ${profile.name}
- Career Goal: ${profile.careerGoal}
- Placement Readiness: ${profile.placementReadiness}%
- Resume Score: ${profile.resumeScore}%
- CGPA: ${profile.gpa}/10
- Skills: ${profile.skills.join(", ")}
- Projects Count: ${studentContext.projects.length}
- Companies Matches count: ${studentContext.recruiterData?.matches?.length || 0}

Evaluate gap, assign readiness boosts (+3% to +10%) and output the JSON.`;

  const rawText = await generateResponse(systemPrompt, userPrompt);
  const parsed = parseJSON(rawText);
  if (parsed && parsed.recommendations) return parsed;

  // Rule-based Fallback
  console.log("ℹ️ [AI Service] generateRecommendation falling back to local engine.");
  const allRecs = [];
  if (profile.resumeScore < 85) {
    allRecs.push({
      title: "Improve your Resume",
      explanation: "quantify project accomplishments and align terms with recruiter search requirements.",
      impact: Math.max(2, Math.round((85 - profile.resumeScore) * 0.25))
    });
  }
  if (studentContext.projects.length < 3) {
    allRecs.push({
      title: "Complete a portfolio Project",
      explanation: `Hiring criteria for '${profile.careerGoal}' roles prioritize hands-on experience. Build another full stack application.`,
      impact: 8
    });
  }
  if (profile.skills.length < 5) {
    allRecs.push({
      title: "Practice DSA coding problems",
      explanation: "Leetcode dynamic programming and trees are frequently evaluated by top recruiters.",
      impact: 6
    });
  }
  if (allRecs.length === 0) {
    allRecs.push({
      title: "Schedule a Mock Interview",
      explanation: "Practice behavior rounds and system architecture prep.",
      impact: 4
    });
  }
  const sumBoost = allRecs.reduce((acc, curr) => acc + curr.impact, 0);
  return {
    predictedAfterCompletion: Math.min(100, profile.placementReadiness + sumBoost),
    recommendations: allRecs.slice(0, 3)
  };
};

/**
 * 2. Generate Daily Reorganized Schedule Plan
 */
export const generateDailyPlan = async (studentContext) => {
  const profile = studentContext.studentProfile;
  const missedTasksList = studentContext.planner?.missedTasks || [];
  const pendingTasksList = studentContext.planner?.todayTasks || [];

  const systemPrompt = `You are the StudentOS AI Planner. Reorganize the student's schedule based on missed tasks, capacity limits, and deadlines.
Total today's workload duration MUST NOT exceed 210 minutes (3.5 hours) to prevent burnout.
Return ONLY a valid JSON object matching this structure:
{
  "reasoning": "Reason why the schedule changed (mention missed tasks and deadlines)",
  "todayPlan": [
    {
      "taskId": "task_id_string",
      "title": "Task Title",
      "durationMinutes": 45,
      "priority": "High"
    }
  ],
  "rescheduledTaskIds": ["task_id_string_1", "task_id_string_2"]
}
Do not write any other text or formatting. Just JSON.`;

  const userPrompt = `Student Planner Context:
- Name: ${profile.name}
- Career Goal: ${profile.careerGoal}
- Max Today Workload limit: 210 minutes
- Learning Style: ${profile.studyPreferences}
- Missed/Overdue Tasks: ${missedTasksList.map(t => `${t.title} (${t.estimatedDurationMinutes}m)`).join(", ") || "None"}
- Today's Pending Tasks: ${pendingTasksList.map(t => `${t.title} (${t.estimatedDurationMinutes}m)`).join(", ") || "None"}
- Upcoming Deadlines: ${(studentContext.calendar?.assignments || []).map(a => a.title).join(", ") || "None"}

Create optimal schedule, determine which rescheduledTaskIds must wait, compile reasoning explanation and return the JSON.`;

  const rawText = await generateResponse(systemPrompt, userPrompt);
  const parsed = parseJSON(rawText);
  if (parsed && parsed.todayPlan) return parsed;

  // Rule-based Fallback
  console.log("ℹ️ [AI Service] generateDailyPlan falling back to local engine.");
  const MAX_WORKLOAD_MINUTES = 210;
  let currentLoad = 0;
  const todayPlan = [];
  const rescheduledTaskIds = [];

  const combined = [...missedTasksList, ...pendingTasksList];
  combined.forEach(t => {
    const duration = t.estimatedDurationMinutes || 60;
    if (currentLoad + duration <= MAX_WORKLOAD_MINUTES) {
      todayPlan.push({
        taskId: t.id,
        title: t.title,
        durationMinutes: duration,
        priority: t.priority || "High"
      });
      currentLoad += duration;
    } else {
      rescheduledTaskIds.push(t.id);
    }
  });

  const missedNames = missedTasksList.map(m => m.title);
  const reasoning = `Your previous plan is no longer optimal. You missed: ${
    missedNames.length > 0 ? missedNames.join(", ") : "None"
  }. I've reorganized today's schedule to balance priority tasks under a 3.5 hour study window.`;

  return {
    reasoning,
    todayPlan,
    rescheduledTaskIds
  };
};

/**
 * 3. Generate Weekly Diagnostic Summary
 */
export const generateWeeklySummary = async (studentContext) => {
  const profile = studentContext.studentProfile;
  const systemPrompt = `You are the StudentOS AI Program Advisor. Provide a diagnostic weekly summary of the student's productivity.
Return ONLY a valid JSON object matching this structure:
{
  "summary": "Actions completed, focus diagnostic and advice",
  "idealWorkloadHours": 20,
  "focusArea": "DSA"
}
Do not write any other text. Just JSON.`;

  const userPrompt = `Student context:
- Name: ${profile.name}
- Career Goal: ${profile.careerGoal}
- Placement Readiness: ${profile.placementReadiness}%
- Completed tasks count: ${studentContext.planner?.completedTasks?.length || 0}
- Missed tasks count: ${studentContext.planner?.missedTasks?.length || 0}`;

  const rawText = await generateResponse(systemPrompt, userPrompt);
  const parsed = parseJSON(rawText);
  if (parsed && parsed.summary) return parsed;

  // Rule-based Fallback
  console.log("ℹ️ [AI Service] generateWeeklySummary falling back to local engine.");
  const completed = studentContext.planner?.completedTasks?.length || 0;
  const missed = studentContext.planner?.missedTasks?.length || 0;
  return {
    summary: `You completed ${completed} tasks this week, and missed ${missed}. Focus on consistency, keeping weekly workload around 20 hours.`,
    idealWorkloadHours: 20,
    focusArea: completed > missed ? "Placement Prep" : "Planner Mastery"
  };
};

/**
 * 4. Chat with Mentor
 */
export const chatWithMentor = async (studentContext, userMessage, history = []) => {
  const profile = studentContext.studentProfile;
  const systemPrompt = `You are the StudentOS AI Mentor, an encouraging, professional academic and career coach.
Use the student's complete live university context below to answer their query with actionable advice.

Student Context:
- Name: ${profile.name}
- Degree/Major: ${profile.degree} in ${profile.major} (Year: ${profile.year})
- CGPA: ${profile.gpa}/10
- Target Career Goal: ${profile.careerGoal}
- Placement Readiness: ${profile.placementReadiness}%
- Resume Score: ${profile.resumeScore}%
- Daily Study Limit: ${profile.availableStudyHours} hours
- Skills: ${profile.skills.join(", ")}

Planner & Calendar:
- Today's Tasks: ${(studentContext.planner?.todayTasks || []).map(t => t.title).join(", ") || "None"}
- Missed Tasks: ${(studentContext.planner?.missedTasks || []).map(t => t.title).join(", ") || "None"}
- Assignments: ${(studentContext.calendar?.assignments || []).map(a => a.title).join(", ") || "None"}

Recruiter Eligibility Matches (Top 5):
${(studentContext.recruiterData?.matches || []).filter(m => m.eligible).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5).map(c => `- ${c.name} (${c.role}): Match Score=${c.matchScore}%`).join("\n")}

Skills Gaps (Top 3 Ineligible):
${(studentContext.recruiterData?.matches || []).filter(m => !m.eligible).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3).map(c => `- Missing criteria for ${c.name}: ${c.missingSkills?.join(", ") || "GPA requirement not met"}`).join("\n")}

Guidelines:
1. Always address the student by their name (${profile.name}).
2. Use markdown formatting, bullet points, and brief, encouraging paragraphs.
3. Reference their career goal, CGPA, projects, or study preferences directly when answering.
4. Keep answers focused, practical, and highly actionable. Avoid long generic essays.`;

  const reply = await generateResponse(systemPrompt, userMessage, history);
  if (reply) return reply;

  // Rule-based Fallback
  console.log("ℹ️ [AI Service] chatWithMentor falling back to local engine.");
  const lowerMsg = userMessage.toLowerCase();
  let replyText = `Hi ${profile.name}! `;
  if (lowerMsg.includes("now") || lowerMsg.includes("task") || lowerMsg.includes("left") || lowerMsg.includes("hour")) {
    const pending = studentContext.planner?.todayTasks || [];
    if (pending.length > 0) {
      replyText += `Since you have some time available, focus on: **${pending[0].title}** (${pending[0].estimatedDurationMinutes} mins). It fits your available daily limit of ${profile.availableStudyHours} hours and directly matches your placement path for ${profile.careerGoal}.`;
    } else {
      replyText += `All tasks are complete! I recommend reviewing your matches or uploading a revised resume (current score is ${profile.resumeScore}%).`;
    }
  } else if (lowerMsg.includes("match") || lowerMsg.includes("eligib") || lowerMsg.includes("company") || lowerMsg.includes("placement")) {
    const count = (studentContext.recruiterData?.matches || []).filter(m => m.eligible).length;
    replyText += `You are currently eligible for **${count} matching companies** based on your CGPA of ${profile.gpa}. Update your resume checklist to unlock more recruiters.`;
  } else if (lowerMsg.includes("skill") || lowerMsg.includes("interview") || lowerMsg.includes("resume")) {
    const missing = [...new Set((studentContext.recruiterData?.matches || []).flatMap(m => m.missingSkills || []))];
    const topMissing = missing.slice(0, 3);
    if (topMissing.length > 0) {
      replyText += `To improve your resume score (${profile.resumeScore}%), focus on acquiring these skills: **${topMissing.join(", ")}**. These are frequently requested by companies you're aiming for.`;
    } else {
      replyText += `Your current skills (${profile.skills.join(", ")}) are looking solid! Consider mock interviews to prep.`;
    }
  } else {
    replyText += `I'm here to help you achieve your career goal of becoming a **${profile.careerGoal}**. What specific task or recruiter requirement can we look at next?`;
  }
  return replyText;
};

/**
 * 5. Analyze Resume Content
 */
export const analyzeResume = async (resumeText) => {
  const systemPrompt = `You are an expert AI Resume Analyzer for Career Intelligence.
Extract information from the provided resume text and return ONLY a valid JSON object.
IMPORTANT: First determine if the text provided is actually a resume. If it is NOT a resume (e.g. a random document, an essay, a syllabus, or gibberish), set "isResume" to false and leave the rest empty.

Structure:
{
  "isResume": true or false,
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1"],
  "programmingLanguages": ["lang1"],
  "frameworks": ["framework1"],
  "libraries": ["lib1"],
  "tools": ["tool1"],
  "databases": ["db1"],
  "certifications": ["cert1"],
  "education": "Brief summary of education",
  "projects": ["Project 1 name/desc", "Project 2"],
  "experience": ["Experience 1", "Experience 2"],
  "github": "URL or empty",
  "linkedin": "URL or empty"
}
Do not include any extra markdown formatting outside the JSON block.`;

  const userPrompt = `Resume Text:\n${resumeText}`;

  const rawText = await generateResponse(systemPrompt, userPrompt);
  const parsed = parseJSON(rawText);
  
  if (parsed) return parsed;
  
  // Fallback
  return {
    isResume: true,
    technicalSkills: ["React", "Node.js", "JavaScript"],
    softSkills: ["Communication", "Teamwork"],
    programmingLanguages: ["JavaScript", "Python"],
    frameworks: ["Express"],
    libraries: [],
    tools: ["Git"],
    databases: ["MongoDB"],
    certifications: [],
    education: "B.Tech Computer Science",
    projects: ["E-commerce App", "Task Manager"],
    experience: [],
    github: "",
    linkedin: ""
  };
};

/**
 * 6. Generate Action Checklist
 */
export const generateActionChecklist = async (resumeAnalysis, studentContext) => {
  const systemPrompt = `You are a Career Coach AI. Generate a personalized resume improvement checklist.
Return ONLY a valid JSON object:
{
  "checklist": ["Action 1", "Action 2", "Action 3"]
}
Limit to top 5-6 actionable items.`;

  const userPrompt = `Student Goal: ${studentContext.studentProfile.careerGoal}
Resume Analysis JSON:
${JSON.stringify(resumeAnalysis)}

Suggest actionable improvements (e.g. Add measurable achievements, add GitHub profile).`;

  const rawText = await generateResponse(systemPrompt, userPrompt);
  const parsed = parseJSON(rawText);
  if (parsed && parsed.checklist) return parsed.checklist;

  // Fallback
  return [
    "Add measurable achievements to projects",
    "Include a link to your GitHub profile",
    "List specific coursework relevant to your goal",
    "Highlight soft skills like leadership"
  ];
};

/**
 * 7. Generate Adaptive Skill Quiz
 */
export const generateSkillQuiz = async (skills) => {
  const systemPrompt = `You are an expert Technical Assessor. Generate a rigorous multiple-choice quiz to verify the student's claimed skills.
Generate exactly 3 questions per skill provided. 
IMPORTANT RULES:
1. Mix question types: For each skill, include 1 fundamental/basic question and 2 applied/scenario-based questions.
2. UNIQUE OPTIONS: Do NOT reuse the same set of options across different questions. Every single question MUST have a completely unique set of 4 plausible, well-crafted options.
3. Indicate the correct answer using correctOptionIndex (0 to 3).

Return ONLY a valid JSON object matching this structure:
{
  "questions": [
    {
      "skill": "React",
      "question": "You need to persist a value across renders without causing a re-render. Which hook should you use?",
      "options": ["useState", "useEffect", "useRef", "useMemo"],
      "correctOptionIndex": 2
    }
  ]
}`;

  const userPrompt = `Skills to verify: ${skills.join(", ")}`;

  const rawText = await generateResponse(systemPrompt, userPrompt);
  const parsed = parseJSON(rawText);
  if (parsed && parsed.questions) return parsed;

  // Fallback if API fails (e.g. quota exceeded)
  const fallbackQuestions = [];
  const commonQuestions = {
    "React": [
      { q: "You need to persist a value across renders without causing a re-render. Which hook should you use?", opts: ["useState", "useEffect", "useRef", "useMemo"], c: 2 },
      { q: "What happens when you call setState in React?", opts: ["It immediately updates the state variable", "It schedules an update to a component's state object", "It forces a synchronous re-render", "It updates the DOM directly"], c: 1 },
      { q: "How can you prevent a child component from re-rendering when its props haven't changed?", opts: ["React.memo", "useContext", "useReducer", "React.Fragment"], c: 0 }
    ],
    "Node.js": [
      { q: "Which of the following describes Node.js's concurrency model?", opts: ["Multi-threaded blocking", "Single-threaded non-blocking event loop", "Multi-process synchronous", "Single-threaded blocking"], c: 1 },
      { q: "How do you handle unhandled promise rejections in a Node.js server?", opts: ["process.on('unhandledRejection')", "try/catch around the server start", "window.onerror", "app.use(errorHandler)"], c: 0 },
      { q: "What is the primary purpose of the 'Buffer' class in Node.js?", opts: ["Caching database queries", "Handling raw binary data", "Buffering HTTP requests to prevent DDOS", "Managing memory garbage collection"], c: 1 }
    ],
    "Python": [
      { q: "What is the difference between a list and a tuple in Python?", opts: ["Lists are mutable, tuples are immutable", "Lists are immutable, tuples are mutable", "Lists can only hold strings", "Tuples are used only for math operations"], c: 0 },
      { q: "You want to create a generator. What keyword must you use in your function?", opts: ["return", "yield", "generate", "async"], c: 1 },
      { q: "What does the '__init__' method do in a Python class?", opts: ["It cleans up memory when the object is destroyed", "It acts as a constructor to initialize the object", "It starts the main execution loop", "It imports necessary modules for the class"], c: 1 }
    ],
    "JavaScript": [
      { q: "What will 'console.log(typeof null)' output?", opts: ["null", "undefined", "object", "string"], c: 2 },
      { q: "You need to execute multiple asynchronous operations concurrently and wait for all to finish. What should you use?", opts: ["Promise.race()", "awaiting them one by one", "Promise.all()", "setTimeout"], c: 2 },
      { q: "What is closure in JavaScript?", opts: ["A function bundled together with its lexical environment", "A method to close a database connection", "A block of code that executes synchronously", "A way to hide HTML elements"], c: 0 }
    ]
  };

  skills.forEach(skill => {
    if (commonQuestions[skill]) {
      commonQuestions[skill].forEach(item => {
        fallbackQuestions.push({ skill, question: item.q, options: item.opts, correctOptionIndex: item.c });
      });
    } else {
      // Generic fallback for unknown skills
      fallbackQuestions.push({
        skill,
        question: `What is a fundamental principle of ${skill}?`,
        options: ["Object-Oriented Design", "Core execution logic", "Memory allocation", "Standardization"],
        correctOptionIndex: 1
      });
      fallbackQuestions.push({
        skill,
        question: `In a production environment, ${skill} is primarily used for:`,
        options: ["Optimizing build processes", "Enhancing user interfaces", "Solving specific domain problems", "Managing server state"],
        correctOptionIndex: 2
      });
      fallbackQuestions.push({
        skill,
        question: `Which scenario best requires the use of ${skill}?`,
        options: ["When performance scaling is needed", "When styling is the priority", "When database schemas change", "When debugging network layers"],
        correctOptionIndex: 0
      });
    }
  });

  return { questions: fallbackQuestions };
};

/**
 * 8. Generate Market Insights
 */
export const generateMarketInsights = async (profile, missingSkills, summary) => {
  if (!missingSkills || missingSkills.length === 0) {
    return "Great job! Your skills are perfectly aligned with current market demands.";
  }

  const systemPrompt = `You are a Career Analyst AI. Based on the student's profile and the live market data, write a short, personalized 2-3 sentence insight explaining WHY learning their missing market skills will help them.
Include specific company names from the market data if relevant. Keep it encouraging and analytical.`;

  const topCompanies = summary.topCompanies.map(c => c.name).join(", ");
  
  const userPrompt = `Student Profile:
- Current Skills: ${profile.skills.join(", ")}
- Missing Market Skills: ${missingSkills.join(", ")}
- Top Hiring Companies in Market: ${topCompanies}

Generate the insight:`;

  try {
    const rawText = await generateResponse(systemPrompt, userPrompt);
    return rawText.trim() || `Learning ${missingSkills[0]} could significantly improve your placement readiness, as it is highly demanded by top companies right now.`;
  } catch (error) {
    console.error("AI Market Insight Error:", error.message);
    return `Learning ${missingSkills[0]} could significantly improve your placement readiness, as it is highly demanded by top companies right now.`;
  }
};

