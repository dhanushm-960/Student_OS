import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const students = await StudentProfile.find().populate("user", "name email");

    if (students.length === 0) {
      return res.json({
        success: true,
        kpis: {
          totalStudents: "0",
          activeUsers: "0",
          placementReadiness: "0%",
          studentEngagement: "0%",
        },
        monthlyData: [],
        goalData: [],
        productivityData: [],
        placementStats: {
          placementReady: "0",
          internshipReady: "0",
          resumeCompletion: "0",
          atRiskCount: "0",
          avgGpa: "0.0",
        },
        dsaData: [],
        deptData: [],
        rankedDepts: [],
        atRiskStudents: [],
        skillData: [],
        heatmapData: [],
        projectStats: {
          totalProjects: "0",
          completedProjectsCount: "0",
          collaborationScore: "0%",
          innovationIndex: "0.0/10",
        },
        topProjects: [],
        companyData: [],
        topRecruiters: [],
        aiInsights: [],
      });
    }

    const totalStudents = students.length;
    const activeUsers = students.filter(s => s.attendance > 75).length;
    const avgPlacement = Math.round(students.reduce((acc, s) => acc + s.placementReadiness, 0) / totalStudents);
    const avgEngagement = Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / totalStudents);

    // monthly active trend (can be mock or based on students database)
    const monthlyData = [
      { month: "Jul", active: Math.round(totalStudents * 0.7), new: Math.round(totalStudents * 0.05), returning: Math.round(totalStudents * 0.65) },
      { month: "Aug", active: Math.round(totalStudents * 0.8), new: Math.round(totalStudents * 0.1), returning: Math.round(totalStudents * 0.7) },
      { month: "Sep", active: Math.round(totalStudents * 0.9), new: Math.round(totalStudents * 0.12), returning: Math.round(totalStudents * 0.78) },
      { month: "Oct", active: Math.round(totalStudents * 0.88), new: Math.round(totalStudents * 0.08), returning: Math.round(totalStudents * 0.8) },
      { month: "Nov", active: Math.round(totalStudents * 0.85), new: Math.round(totalStudents * 0.05), returning: Math.round(totalStudents * 0.8) },
      { month: "Dec", active: Math.round(totalStudents * 0.7), new: Math.round(totalStudents * 0.03), returning: Math.round(totalStudents * 0.67) },
      { month: "Jan", active: Math.round(totalStudents * 0.92), new: Math.round(totalStudents * 0.15), returning: Math.round(totalStudents * 0.77) },
      { month: "Feb", active: Math.round(totalStudents * 0.95), new: Math.round(totalStudents * 0.09), returning: Math.round(totalStudents * 0.86) },
      { month: "Mar", active: Math.round(totalStudents * 0.98), new: Math.round(totalStudents * 0.08), returning: Math.round(totalStudents * 0.9) },
      { month: "Apr", active: activeUsers, new: Math.round(totalStudents * 0.06), returning: Math.round(totalStudents * 0.82) },
    ];

    // goalData
    const completedGoals = students.filter(s => s.goalProgress >= 80).length;
    const progressGoals = students.filter(s => s.goalProgress >= 30 && s.goalProgress < 80).length;
    const notStartedGoals = totalStudents - completedGoals - progressGoals;
    const goalData = [
      { name: "Completed", value: Math.round((completedGoals / totalStudents) * 100) },
      { name: "In Progress", value: Math.round((progressGoals / totalStudents) * 100) },
      { name: "Not Started", value: Math.round((notStartedGoals / totalStudents) * 100) },
    ];

    // productivityData (mock/calculated trend)
    const avgProductivity = Math.round(students.reduce((acc, s) => acc + (s.gpa * 10), 0) / totalStudents);
    const productivityData = [
      { week: "W1", score: Math.max(50, avgProductivity - 8) },
      { week: "W2", score: Math.max(50, avgProductivity - 10) },
      { week: "W3", score: Math.max(50, avgProductivity - 5) },
      { week: "W4", score: Math.max(50, avgProductivity) },
      { week: "W5", score: Math.max(50, avgProductivity - 3) },
      { week: "W6", score: Math.max(50, avgProductivity + 2) },
      { week: "W7", score: Math.max(50, avgProductivity + 1) },
      { week: "W8", score: Math.max(50, avgProductivity + 4) },
    ];

    // Placement Section
    const placementReady = students.filter(s => s.placementReadiness >= 80).length;
    const internshipReady = students.filter(s => s.placementReadiness >= 50).length;
    const resumeCompletion = students.filter(s => s.projectsCompleted >= 2).length;

    const dsaData = [
      { level: "Beginner", count: students.filter(s => s.dsaProgress < 40).length },
      { level: "Intermediate", count: students.filter(s => s.dsaProgress >= 40 && s.dsaProgress < 70).length },
      { level: "Advanced", count: students.filter(s => s.dsaProgress >= 70 && s.dsaProgress < 85).length },
      { level: "Expert", count: students.filter(s => s.dsaProgress >= 85).length },
    ];

    // Department Performance
    const depts = ["CSE", "IT", "Electronics", "Mechanical", "Civil"];
    const deptData = depts.map(d => {
      const deptStudents = students.filter(s => s.department === d);
      if (deptStudents.length === 0) {
        return { dept: d === "Electronics" ? "ECE" : d === "Mechanical" ? "Mech" : d, productivity: 0, placement: 0, assignment: 0, engagement: 0 };
      }
      const count = deptStudents.length;
      return {
        dept: d === "Electronics" ? "ECE" : d === "Mechanical" ? "Mech" : d,
        productivity: Math.round(deptStudents.reduce((acc, s) => acc + (s.gpa * 10), 0) / count),
        placement: Math.round(deptStudents.reduce((acc, s) => acc + s.placementReadiness, 0) / count),
        assignment: Math.round(deptStudents.reduce((acc, s) => acc + s.goalProgress, 0) / count),
        engagement: Math.round(deptStudents.reduce((acc, s) => acc + s.attendance, 0) / count),
      };
    });

    const deptRankings = deptData.map(d => {
      const score = Math.round((d.productivity + d.placement + d.assignment + d.engagement) / 4);
      return { name: d.dept === "ECE" ? "Electronics" : d.dept === "Mech" ? "Mechanical" : d.dept === "CSE" ? "Computer Science" : d.dept === "IT" ? "Information Technology" : "Civil", score };
    }).sort((a, b) => b.score - a.score);

    const medals = ["🥇", "🥈", "🥉", "4th", "5th"];
    const rankedDepts = deptRankings.map((r, i) => ({ ...r, medal: medals[i] || `${i + 1}th` }));

    // At Risk Students (limit to 10 for dashboard preview)
    const atRiskStudents = students
      .filter(s => s.riskLevel === "High" || s.riskLevel === "Medium")
      .map(s => ({
        id: s._id,
        name: s.user?.name || "Student",
        dept: s.department,
        attendance: `${s.attendance}%`,
        score: Math.round(s.gpa * 10),
        risk: s.riskLevel,
      }))
      .slice(0, 10);

    // Skill data
    const skillData = [
      { skill: "Data Structures", enrolled: totalStudents, completed: students.filter(s => s.dsaProgress >= 70).length, growth: 28 },
      { skill: "Full Stack Dev", enrolled: totalStudents, completed: students.filter(s => s.projectsCompleted >= 3).length, growth: 35 },
      { skill: "Machine Learning", enrolled: Math.round(totalStudents * 0.6), completed: students.filter(s => s.gpa >= 8.5 && s.department === "CSE").length, growth: 42 },
      { skill: "Aptitude & Reasoning", enrolled: totalStudents, completed: students.filter(s => s.placementReadiness >= 60).length, growth: 15 },
      { skill: "System Design", enrolled: Math.round(totalStudents * 0.4), completed: students.filter(s => s.year >= 3 && s.dsaProgress >= 80).length, growth: 55 },
    ];

    const heatmapData = depts.map(d => {
      const deptStudents = students.filter(s => s.department === d);
      const count = deptStudents.length || 1;
      return {
        dept: d === "Electronics" ? "ECE" : d === "Mechanical" ? "Mech" : d,
        dsa: Math.round(deptStudents.reduce((acc, s) => acc + s.dsaProgress, 0) / count),
        fullstack: Math.round(deptStudents.reduce((acc, s) => acc + (s.projectsCompleted * 20), 0) / count),
        ml: Math.round(deptStudents.reduce((acc, s) => acc + (s.gpa * 10), 0) / count),
        aptitude: Math.round(deptStudents.reduce((acc, s) => acc + s.placementReadiness, 0) / count),
      };
    });

    // Projects stats
    const totalProjects = students.reduce((acc, s) => acc + s.projectsCompleted, 0);
    const completedProjectsCount = Math.round(totalProjects * 0.7);
    const collaborationScore = 87;
    const innovationIndex = 9.2;
    const topProjects = [
      { title: "AI-Powered Traffic Management", team: "CSE – Team Alpha", score: 96, tags: ["ML", "IoT"] },
      { title: "Blockchain Supply Chain Tracker", team: "IT – Team Nexus", score: 93, tags: ["Web3", "React"] },
      { title: "Smart Campus Energy Monitor", team: "ECE – Team Volt", score: 89, tags: ["Embedded", "Cloud"] },
      { title: "Predictive Healthcare Dashboard", team: "CSE – Team Sigma", score: 87, tags: ["Python", "ML"] },
    ];

    // Companies / Recruiters
    const companyData = [
      { company: "Google", placed: Math.max(1, Math.round(totalStudents * 0.03)) },
      { company: "Microsoft", placed: Math.max(1, Math.round(totalStudents * 0.05)) },
      { company: "Amazon", placed: Math.max(1, Math.round(totalStudents * 0.06)) },
      { company: "Infosys", placed: Math.max(1, Math.round(totalStudents * 0.12)) },
      { company: "TCS", placed: Math.max(1, Math.round(totalStudents * 0.10)) },
      { company: "Wipro", placed: Math.max(1, Math.round(totalStudents * 0.08)) },
    ];

    const topRecruiters = [
      { name: "Infosys", logo: "IN", offers: Math.max(1, Math.round(totalStudents * 0.12)), salary: "₹5.2L", type: "Mass" },
      { name: "TCS", logo: "TC", offers: Math.max(1, Math.round(totalStudents * 0.10)), salary: "₹4.8L", type: "Mass" },
      { name: "Wipro", logo: "WI", offers: Math.max(1, Math.round(totalStudents * 0.08)), salary: "₹5.0L", type: "Mass" },
      { name: "Microsoft", logo: "MS", offers: Math.max(1, Math.round(totalStudents * 0.05)), salary: "₹28L", type: "Dream" },
      { name: "Amazon", logo: "AZ", offers: Math.max(1, Math.round(totalStudents * 0.06)), salary: "₹22L", type: "Super Dream" },
    ];

    const atRiskCount = students.filter(s => s.riskLevel === "High").length;
    const aiInsights = [
      {
        title: "Engagement Drop Detected",
        body: `Student engagement drops by 18% during examination periods. Recommend scheduling wellness check-ins proactively.`,
        tag: "Behavioral",
      },
      {
        title: "Top Performing Department",
        body: `IT Department has the highest placement readiness score at ${deptData.find(d => d.dept === "IT")?.placement || 91}%. Key factor: consistent project submissions.`,
        tag: "Achievement",
      },
      {
        title: "Interview Preparation Gap",
        body: `Final year students need additional support in mock interviews. Only 34% have completed at least 3 practice sessions.`,
        tag: "Action Required",
      },
      {
        title: "Coding Activity Surge",
        body: `GitHub commits up 32% in final year. Hackathon participation drives the spike — ${totalStudents * 3} active repositories.`,
        tag: "Positive Signal",
      },
      {
        title: "Department Gap Alert",
        body: `Civil Engineering shows lowest placement readiness at ${deptData.find(d => d.dept === "Civil")?.placement || 55}%. Recommend targeted skill workshops.`,
        tag: "Intervention",
      },
      {
        title: "ML Skill Growth",
        body: `Machine learning course completions grew 42% YoY. Student-led study groups correlate with higher completion rates.`,
        tag: "Insight",
      },
    ];

    res.json({
      success: true,
      kpis: {
        totalStudents: totalStudents.toLocaleString(),
        activeUsers: activeUsers.toLocaleString(),
        placementReadiness: `${avgPlacement}%`,
        studentEngagement: `${avgEngagement}%`,
      },
      monthlyData,
      goalData,
      productivityData,
      placementStats: {
        placementReady: placementReady.toLocaleString(),
        internshipReady: internshipReady.toLocaleString(),
        resumeCompletion: resumeCompletion.toLocaleString(),
        atRiskCount: atRiskCount.toString(),
        avgGpa: (students.reduce((acc, s) => acc + s.gpa, 0) / totalStudents).toFixed(1),
      },
      dsaData,
      deptData,
      rankedDepts,
      atRiskStudents,
      skillData,
      heatmapData,
      projectStats: {
        totalProjects: totalProjects.toString(),
        completedProjectsCount: completedProjectsCount.toString(),
        collaborationScore: `${collaborationScore}%`,
        innovationIndex: `${innovationIndex}/10`,
      },
      topProjects,
      companyData,
      topRecruiters,
      aiInsights,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Students (filtered/searched)
// @route   GET /api/admin/students
// @access  Private/Admin
export const getStudents = async (req, res, next) => {
  const { search, dept } = req.query;

  try {
    let query = {};

    if (dept && dept !== "All") {
      query.department = dept;
    }

    let students = await StudentProfile.find(query).populate("user", "name email");

    // Perform text search on name or roll number if search is provided
    if (search) {
      const searchLower = search.toLowerCase();
      students = students.filter(s =>
        s.rollNumber.toLowerCase().includes(searchLower) ||
        (s.user && s.user.name.toLowerCase().includes(searchLower))
      );
    }

    const formattedStudents = students.map(s => ({
      id: s._id,
      name: s.user?.name || "Unknown",
      email: s.user?.email || "",
      roll: s.rollNumber,
      dept: s.department === "Electronics" ? "Electronics" : s.department === "Mechanical" ? "Mechanical" : s.department, // Align UI names if needed
      year: s.year,
      gpa: s.gpa,
      attendance: s.attendance,
      dsa: s.dsaProgress,
      projects: s.projectsCompleted,
      placement: s.placementReadiness,
      goals: s.goalProgress,
      risk: s.riskLevel,
    }));

    res.json({
      success: true,
      students: formattedStudents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Student Details
// @route   GET /api/admin/students/:id
// @access  Private/Admin
export const getStudentById = async (req, res, next) => {
  try {
    const student = await StudentProfile.findById(req.params.id).populate("user", "name email");

    if (!student) {
      res.status(404);
      throw new Error("Student not found.");
    }

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.user?.name || "Unknown",
        email: student.user?.email || "",
        roll: student.rollNumber,
        dept: student.department,
        year: student.year,
        gpa: student.gpa,
        attendance: student.attendance,
        dsa: student.dsaProgress,
        projects: student.projectsCompleted,
        placement: student.placementReadiness,
        goals: student.goalProgress,
        risk: student.riskLevel,
        aiRecommendations: student.aiRecommendations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new student user and profile
// @route   POST /api/admin/students
// @access  Private/Admin
export const createStudent = async (req, res, next) => {
  const {
    name,
    email,
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
    aiRecommendations,
  } = req.body;

  try {
    if (!name || !email || !rollNumber || !department) {
      res.status(400);
      throw new Error("Name, email, roll number, and department are required.");
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User with this email already exists.");
    }

    // Check if student profile already exists with this roll number
    const profileExists = await StudentProfile.findOne({ rollNumber });
    if (profileExists) {
      res.status(400);
      throw new Error("Student profile with this roll number already exists.");
    }

    const defaultPassword = "Student@123";
    const user = await User.create({
      name,
      email,
      password: defaultPassword,
      role: "student",
    });

    // Create student profile
    const profile = await StudentProfile.create({
      user: user._id,
      rollNumber,
      department,
      year: Number(year) || 1,
      gpa: Number(gpa) || 0,
      attendance: Number(attendance) || 0,
      dsaProgress: Number(dsaProgress) || 0,
      projectsCompleted: Number(projectsCompleted) || 0,
      placementReadiness: Number(placementReadiness) || 0,
      goalProgress: Number(goalProgress) || 0,
      riskLevel: riskLevel || "Low",
      aiRecommendations: aiRecommendations || [
        "Complete DSA practice problems daily — target 5 LeetCode problems/week",
        "Participate in upcoming mock interview sessions this Friday",
      ],
    });

    res.status(201).json({
      success: true,
      message: "Student user and profile created successfully.",
      student: {
        id: profile._id,
        name: user.name,
        email: user.email,
        roll: profile.rollNumber,
        dept: profile.department,
        year: profile.year,
        gpa: profile.gpa,
        attendance: profile.attendance,
        dsa: profile.dsaProgress,
        projects: profile.projectsCompleted,
        placement: profile.placementReadiness,
        goals: profile.goalProgress,
        risk: profile.riskLevel,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student profile and associated user
// @route   DELETE /api/admin/students/:id
// @access  Private/Admin
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await StudentProfile.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error("Student not found.");
    }

    // Delete associated User document
    await User.findByIdAndDelete(student.user);

    // Delete StudentProfile document
    await StudentProfile.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Student and associated user account deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
