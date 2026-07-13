import StudentProfile from "../models/StudentProfile.js";
import { generateSkillQuiz } from "../utils/aiService.js";

// @desc    Generate a skill verification quiz for the student
// @route   GET /api/student/quiz/generate
// @access  Private
export const generateQuiz = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    if (!profile.resumeDetails || !profile.resumeDetails.skills || profile.resumeDetails.skills.length === 0) {
      res.status(400);
      throw new Error("No skills found. Please upload your resume first.");
    }

    // Take top 5 skills
    const skillsToTest = profile.resumeDetails.skills.slice(0, 5);
    
    // Generate quiz using Gemini
    const quizData = await generateSkillQuiz(skillsToTest);
    
    if (!quizData || !quizData.questions) {
      res.status(500);
      throw new Error("Failed to generate quiz. Try again later.");
    }

    // Save session in DB (with correct answers)
    profile.currentQuizSession = {
      questions: quizData.questions,
      generatedAt: new Date()
    };
    await profile.save();

    // Strip correct options before sending to frontend
    const sanitizedQuestions = quizData.questions.map(q => ({
      skill: q.skill,
      question: q.question,
      options: q.options
    }));

    res.json({
      success: true,
      questions: sanitizedQuestions,
      skillsTested: skillsToTest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answers for the skill verification quiz
// @route   POST /api/student/quiz/submit
// @access  Private
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body; // array of indices
    
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    if (!profile.currentQuizSession || !profile.currentQuizSession.questions || profile.currentQuizSession.questions.length === 0) {
      res.status(400);
      throw new Error("No active quiz session found. Please generate a new quiz.");
    }

    const questions = profile.currentQuizSession.questions;
    
    if (!answers || answers.length !== questions.length) {
      res.status(400);
      throw new Error("Invalid submission: missing answers.");
    }

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= 70;

    // Update skillVerification logic
    const uniqueSkillsTested = Array.from(new Set(questions.map(q => q.skill)));
    
    const attempts = (profile.skillVerification?.attempts || 0) + 1;
    
    profile.skillVerification = {
      verified: passed,
      score: scorePercentage,
      skillsTested: uniqueSkillsTested,
      attempts: attempts,
      lastAttemptedAt: new Date(),
      verifiedAt: passed ? new Date() : (profile.skillVerification?.verifiedAt || null)
    };

    // Clear session
    profile.currentQuizSession = undefined;
    
    await profile.save();

    res.json({
      success: true,
      passed,
      score: scorePercentage,
      message: passed ? "Congratulations! Skills verified." : "Keep practicing! Score was below 70%."
    });
  } catch (error) {
    next(error);
  }
};
