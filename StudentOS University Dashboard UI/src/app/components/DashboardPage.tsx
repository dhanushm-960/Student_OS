import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import {
  Users, TrendingUp, Target, Zap, ArrowUpRight, ArrowDownRight,
  Brain, AlertTriangle, CheckCircle, Star, Code, Cpu, BookOpen,
  FolderGit2, Award, Building2, ChevronRight
} from "lucide-react";

/* ─── Color tokens ─── */
const C = {
  indigo: "#4F46E5",
  purple: "#7C3AED",
  cyan: "#06B6D4",
  green: "#10B981",
  amber: "#F59E0B",
  rose: "#F43F5E",
  indigo100: "#EEF2FF",
  indigo200: "#C7D2FE",
};

/* ─── Shared card wrapper ─── */
function Card({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: "white",
        border: "1px solid rgba(79,70,229,0.1)",
        boxShadow: "0 1px 3px rgba(79,70,229,0.06), 0 4px 16px rgba(79,70,229,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display" style={{ color: "var(--foreground)" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── Section 1: KPI Cards ─── */
const kpis = [
  {
    label: "Total Students",
    value: "12,450",
    trend: "+3.2%",
    up: true,
    icon: Users,
    color: C.indigo,
    bg: "#EEF2FF",
    sub: "Across all departments",
  },
  {
    label: "Active Users",
    value: "8,750",
    trend: "+5.8%",
    up: true,
    icon: Zap,
    color: C.purple,
    bg: "#F5F3FF",
    sub: "Last 30 days",
  },
  {
    label: "Placement Readiness",
    value: "78%",
    trend: "+2.1%",
    up: true,
    icon: Target,
    color: C.green,
    bg: "#ECFDF5",
    sub: "Final year students",
  },
  {
    label: "Student Engagement",
    value: "85%",
    trend: "-0.4%",
    up: false,
    icon: TrendingUp,
    color: C.amber,
    bg: "#FFFBEB",
    sub: "Platform engagement rate",
  },
];

function OverviewCards() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label} className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: kpi.bg }}
              >
                <Icon size={18} style={{ color: kpi.color }} />
              </div>
              <span
                className="flex items-center gap-1 text-xs font-500 px-2 py-0.5 rounded-full"
                style={{
                  background: kpi.up ? "#ECFDF5" : "#FFF1F2",
                  color: kpi.up ? "#059669" : "#F43F5E",
                }}
              >
                {kpi.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {kpi.trend}
              </span>
            </div>
            <div
              className="font-display mb-1"
              style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.1 }}
            >
              {kpi.value}
            </div>
            <div className="text-sm font-500" style={{ color: "var(--foreground)" }}>
              {kpi.label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {kpi.sub}
            </div>
            <div
              className="absolute bottom-0 right-0 w-20 h-20 rounded-full opacity-5"
              style={{ background: kpi.color, transform: "translate(30%, 30%)" }}
            />
          </Card>
        );
      })}
    </div>
  );
}

/* ─── Section 2: Student Success Charts ─── */
const monthlyData = [
  { month: "Jul", active: 6200, new: 420, returning: 5780 },
  { month: "Aug", active: 7100, new: 980, returning: 6120 },
  { month: "Sep", active: 8400, new: 1100, returning: 7300 },
  { month: "Oct", active: 8100, new: 680, returning: 7420 },
  { month: "Nov", active: 7600, new: 410, returning: 7190 },
  { month: "Dec", active: 6300, new: 230, returning: 6070 },
  { month: "Jan", active: 8900, new: 1200, returning: 7700 },
  { month: "Feb", active: 9200, new: 890, returning: 8310 },
  { month: "Mar", active: 9500, new: 760, returning: 8740 },
  { month: "Apr", active: 8750, new: 590, returning: 8160 },
];

const goalData = [
  { name: "Completed", value: 62 },
  { name: "In Progress", value: 24 },
  { name: "Not Started", value: 14 },
];

const productivityData = [
  { week: "W1", score: 72 },
  { week: "W2", score: 68 },
  { week: "W3", score: 75 },
  { week: "W4", score: 80 },
  { week: "W5", score: 74 },
  { week: "W6", score: 82 },
  { week: "W7", score: 79 },
  { week: "W8", score: 85 },
];

const GOAL_COLORS = [C.indigo, C.cyan, "#E5E7EB"];

function StudentSuccessCharts() {
  return (
    <div className="mb-6">
      <SectionTitle
        title="Student Success Analytics"
        subtitle="Platform usage and performance trends"
      />
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-600" style={{ color: "var(--foreground)" }}>
                Monthly Active Students
              </div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Jul 2023 — Apr 2024
              </div>
            </div>
            <div className="flex gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: C.indigo }} />
                Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: C.purple }} />
                New
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.indigo} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.indigo} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.purple} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,70,229,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid rgba(79,70,229,0.1)", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="active" stroke={C.indigo} strokeWidth={2} fill="url(#activeGrad)" />
              <Area type="monotone" dataKey="new" stroke={C.purple} strokeWidth={2} fill="url(#newGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="text-sm font-600 mb-1" style={{ color: "var(--foreground)" }}>
            Goal Completion Rates
          </div>
          <div className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
            Current semester
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={goalData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={3}
                dataKey="value"
              >
                {goalData.map((_, i) => (
                  <Cell key={`goal-cell-${i}`} fill={GOAL_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {goalData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: GOAL_COLORS[i] }} />
                  {d.name}
                </span>
                <span className="font-600" style={{ color: "var(--foreground)" }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-600" style={{ color: "var(--foreground)" }}>
                Student Productivity Trends
              </div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                8-week rolling average score
              </div>
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs font-500"
              style={{ background: "#ECFDF5", color: "#059669" }}
            >
              +18% improvement
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={productivityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,70,229,0.06)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[60, 90]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(79,70,229,0.1)", fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke={C.indigo}
                strokeWidth={2.5}
                dot={{ fill: C.indigo, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* ─── Section 3: Placement Analytics ─── */
const dsaData = [
  { level: "Beginner", count: 2100 },
  { level: "Intermediate", count: 3400 },
  { level: "Advanced", count: 1800 },
  { level: "Expert", count: 650 },
];

function PlacementSection() {
  const stats = [
    { label: "Placement Ready", value: "4,820", pct: 78, color: C.indigo },
    { label: "Internship Ready", value: "6,230", pct: 85, color: C.purple },
    { label: "Resume Completion", value: "7,480", pct: 91, color: C.green },
  ];

  return (
    <div className="mb-6">
      <SectionTitle title="Placement Analytics" subtitle="Readiness and preparation metrics" />
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-1 flex flex-col gap-5">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-500" style={{ color: "var(--foreground)" }}>
                  {s.label}
                </span>
                <span className="text-sm font-600" style={{ color: s.color }}>
                  {s.value}
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "#EEF2FF" }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${s.pct}%`, background: s.color }}
                />
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {s.pct}% of eligible students
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div className="text-sm font-600 mb-1" style={{ color: "var(--foreground)" }}>
            DSA Progress Distribution
          </div>
          <div className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
            By proficiency level
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dsaData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,70,229,0.06)" />
              <XAxis dataKey="level" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {dsaData.map((_, i) => (
                  <Cell key={`dsa-cell-${i}`} fill={[C.indigo, C.purple, C.cyan, C.green][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)", border: "none" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(79,70,229,0.4)" }}>
              <Brain size={14} className="text-indigo-200" />
            </div>
            <span className="text-sm font-600 text-white">AI Insight</span>
          </div>
          <p className="text-sm text-indigo-200 leading-relaxed mb-4">
            3rd year CSE students have <span className="text-white font-600">lower project completion rates</span> compared to the previous semester — down 14%.
          </p>
          <div className="space-y-2">
            {[
              "Resume workshops needed for 340 students",
              "Mock interview gap: 28% in CSE",
              "GitHub contribution avg: 12 commits/month",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-xs text-indigo-300">
                <ChevronRight size={12} className="mt-0.5 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── Section 4: Department Performance ─── */
const deptData = [
  { dept: "CSE", productivity: 82, placement: 88, assignment: 79, engagement: 85 },
  { dept: "IT", productivity: 78, placement: 91, assignment: 82, engagement: 80 },
  { dept: "ECE", productivity: 70, placement: 72, assignment: 74, engagement: 71 },
  { dept: "Mech", productivity: 65, placement: 61, assignment: 68, engagement: 63 },
  { dept: "Civil", productivity: 60, placement: 55, assignment: 63, engagement: 59 },
];

function DepartmentPerformance() {
  return (
    <div className="mb-6">
      <SectionTitle title="Department Performance" subtitle="Comparative metrics across all departments" />
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <div className="text-sm font-600 mb-1" style={{ color: "var(--foreground)" }}>
            Department Comparison
          </div>
          <div className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
            All metrics as % score
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,70,229,0.06)" />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }} />
              <Bar dataKey="productivity" name="Productivity" fill={C.indigo} radius={[4, 4, 0, 0]} />
              <Bar dataKey="placement" name="Placement" fill={C.purple} radius={[4, 4, 0, 0]} />
              <Bar dataKey="assignment" name="Assignment" fill={C.cyan} radius={[4, 4, 0, 0]} />
              <Bar dataKey="engagement" name="Engagement" fill={C.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="text-sm font-600 mb-4" style={{ color: "var(--foreground)" }}>
            Department Rankings
          </div>
          <div className="space-y-3">
            {[
              { name: "Information Technology", score: 82, medal: "🥇" },
              { name: "Computer Science", score: 79, medal: "🥈" },
              { name: "Electronics", score: 71, medal: "🥉" },
              { name: "Mechanical", score: 64, medal: "4th" },
              { name: "Civil", medal: "5th", score: 59 },
            ].map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <div className="text-sm w-6 text-center">{d.medal}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-500 truncate" style={{ color: "var(--foreground)" }}>
                    {d.name}
                  </div>
                  <div className="h-1.5 rounded-full mt-1" style={{ background: "#EEF2FF" }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${d.score}%`,
                        background: `linear-gradient(90deg, ${C.indigo}, ${C.purple})`,
                      }}
                    />
                  </div>
                </div>
                <div className="text-xs font-600" style={{ color: C.indigo }}>
                  {d.score}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── Section 5: At-Risk Students ─── */
const atRiskStudents = [
  { name: "Rahul Sharma", dept: "Mechanical", attendance: "51%", score: 34, risk: "High" },
  { name: "Priya Nair", dept: "Civil", attendance: "58%", score: 41, risk: "High" },
  { name: "Arjun Mehta", dept: "Electronics", attendance: "63%", score: 48, risk: "Medium" },
  { name: "Sneha Patel", dept: "CSE", attendance: "67%", score: 52, risk: "Medium" },
  { name: "Kiran Kumar", dept: "IT", attendance: "70%", score: 55, risk: "Medium" },
  { name: "Divya Reddy", dept: "Mechanical", attendance: "55%", score: 38, risk: "High" },
];

const riskColors: Record<string, { bg: string; text: string }> = {
  High: { bg: "#FFF1F2", text: "#F43F5E" },
  Medium: { bg: "#FFFBEB", text: "#D97706" },
  Low: { bg: "#ECFDF5", text: "#059669" },
};

function AtRiskStudents() {
  return (
    <div className="mb-6">
      <SectionTitle title="At-Risk Students" subtitle="Students requiring academic intervention" />
      <Card>
        <div
          className="flex items-center gap-3 p-3 rounded-xl mb-4"
          style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}
        >
          <AlertTriangle size={16} style={{ color: "#F59E0B" }} />
          <p className="text-sm" style={{ color: "#92400E" }}>
            <span className="font-600">AI Recommendation:</span> 132 students may require academic intervention this month. Immediate outreach suggested for 48 high-risk students.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(79,70,229,0.08)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8F9FF" }}>
                {["Student Name", "Department", "Attendance", "Productivity Score", "Risk Level", "Action"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-600 uppercase tracking-wide"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {atRiskStudents.map((s, i) => (
                <tr
                  key={s.name}
                  className="transition-colors hover:bg-indigo-50/50"
                  style={{ borderTop: i > 0 ? "1px solid rgba(79,70,229,0.06)" : "none" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-600"
                        style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})` }}
                      >
                        {s.name[0]}
                      </div>
                      <span className="text-sm font-500" style={{ color: "var(--foreground)" }}>
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {s.dept}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-sm font-500"
                      style={{ color: parseInt(s.attendance) < 60 ? C.rose : "var(--foreground)" }}
                    >
                      {s.attendance}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full" style={{ background: "#EEF2FF" }}>
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${s.score}%`,
                            background: s.score < 45 ? C.rose : s.score < 60 ? C.amber : C.green,
                          }}
                        />
                      </div>
                      <span className="text-xs font-500" style={{ color: "var(--foreground)" }}>
                        {s.score}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-600"
                      style={riskColors[s.risk]}
                    >
                      {s.risk}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-xs font-500 px-3 py-1 rounded-lg transition-colors"
                      style={{ color: C.indigo, background: "#EEF2FF" }}
                    >
                      Reach Out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ─── Section 6: Skill Development ─── */
const skillData = [
  { skill: "Data Structures", enrolled: 3200, completed: 2100, growth: 28 },
  { skill: "Full Stack Dev", enrolled: 2800, completed: 1650, growth: 35 },
  { skill: "Machine Learning", enrolled: 2100, completed: 980, growth: 42 },
  { skill: "Aptitude & Reasoning", enrolled: 4100, completed: 3200, growth: 15 },
  { skill: "System Design", enrolled: 1200, completed: 480, growth: 55 },
];

const heatmapData = [
  { dept: "CSE", dsa: 88, fullstack: 75, ml: 82, aptitude: 79 },
  { dept: "IT", dsa: 72, fullstack: 88, ml: 65, aptitude: 80 },
  { dept: "ECE", dsa: 60, fullstack: 45, ml: 70, aptitude: 72 },
  { dept: "Mech", dsa: 40, fullstack: 30, ml: 35, aptitude: 65 },
  { dept: "Civil", dsa: 35, fullstack: 28, ml: 30, aptitude: 60 },
];

function heatColor(val: number) {
  if (val >= 80) return { bg: "#312E81", text: "#C7D2FE" };
  if (val >= 65) return { bg: "#4F46E5", text: "white" };
  if (val >= 50) return { bg: "#818CF8", text: "white" };
  if (val >= 35) return { bg: "#C7D2FE", text: "#312E81" };
  return { bg: "#EEF2FF", text: "#6B7280" };
}

function SkillDevelopment() {
  return (
    <div className="mb-6">
      <SectionTitle title="Skill Development Insights" subtitle="Top skills learned and department-wise progress" />
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <div className="text-sm font-600 mb-4" style={{ color: "var(--foreground)" }}>
            Top Skills Learned
          </div>
          <div className="space-y-4">
            {skillData.map((s) => (
              <div key={s.skill}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-500" style={{ color: "var(--foreground)" }}>
                      {s.skill}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md font-500"
                      style={{ background: "#ECFDF5", color: "#059669" }}
                    >
                      +{s.growth}%
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {s.completed.toLocaleString()} / {s.enrolled.toLocaleString()} completed
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "#EEF2FF" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(s.completed / s.enrolled) * 100}%`,
                      background: `linear-gradient(90deg, ${C.indigo}, ${C.purple})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="text-sm font-600 mb-4" style={{ color: "var(--foreground)" }}>
            Skill Heatmap by Dept.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left pb-2 pr-2 font-500" style={{ color: "var(--muted-foreground)" }}>
                    Dept
                  </th>
                  {["DSA", "FS", "ML", "Apt"].map((h) => (
                    <th key={h} className="text-center pb-2 px-1 font-500" style={{ color: "var(--muted-foreground)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row) => (
                  <tr key={row.dept}>
                    <td className="pr-2 py-1 font-500" style={{ color: "var(--foreground)" }}>
                      {row.dept}
                    </td>
                    {[row.dsa, row.fullstack, row.ml, row.aptitude].map((val, i) => {
                      const colors = heatColor(val);
                      return (
                        <td key={i} className="px-1 py-1 text-center">
                          <div
                            className="w-full rounded-md py-1 font-600"
                            style={{ background: colors.bg, color: colors.text, minWidth: 32 }}
                          >
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {[
              { label: "90+", bg: "#312E81", text: "#C7D2FE" },
              { label: "65+", bg: "#4F46E5", text: "white" },
              { label: "50+", bg: "#818CF8", text: "white" },
              { label: "35+", bg: "#C7D2FE", text: "#312E81" },
              { label: "<35", bg: "#EEF2FF", text: "#6B7280" },
            ].map((l) => (
              <span
                key={l.label}
                className="text-xs px-2 py-0.5 rounded font-500"
                style={{ background: l.bg, color: l.text }}
              >
                {l.label}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── Section 7: Project Analytics ─── */
const topProjects = [
  { title: "AI-Powered Traffic Management", team: "CSE – Team Alpha", score: 96, tags: ["ML", "IoT"] },
  { title: "Blockchain Supply Chain Tracker", team: "IT – Team Nexus", score: 93, tags: ["Web3", "React"] },
  { title: "Smart Campus Energy Monitor", team: "ECE – Team Volt", score: 89, tags: ["Embedded", "Cloud"] },
  { title: "Predictive Healthcare Dashboard", team: "CSE – Team Sigma", score: 87, tags: ["Python", "ML"] },
];

function ProjectAnalytics() {
  const stats = [
    { label: "Active Projects", value: "284", icon: FolderGit2, color: C.indigo, bg: "#EEF2FF" },
    { label: "Completed", value: "156", icon: CheckCircle, color: C.green, bg: "#ECFDF5" },
    { label: "Collaboration Score", value: "87%", icon: Users, color: C.purple, bg: "#F5F3FF" },
    { label: "Innovation Index", value: "9.2/10", icon: Star, color: C.amber, bg: "#FFFBEB" },
  ];

  return (
    <div className="mb-6">
      <SectionTitle title="Project Analytics" subtitle="Student project activity and innovation metrics" />
      <div className="grid grid-cols-4 gap-4 mb-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg }}
              >
                <Icon size={17} style={{ color: s.color }} />
              </div>
              <div>
                <div
                  className="font-display font-700"
                  style={{ fontSize: "1.25rem", color: "var(--foreground)", lineHeight: 1.2 }}
                >
                  {s.value}
                </div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {s.label}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Card>
        <div className="text-sm font-600 mb-4" style={{ color: "var(--foreground)" }}>
          Top Student Projects
        </div>
        <div className="grid grid-cols-2 gap-3">
          {topProjects.map((p, i) => (
            <div
              key={p.title}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: "#F8F9FF", border: "1px solid rgba(79,70,229,0.08)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-700 flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})` }}
              >
                #{i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-500 truncate" style={{ color: "var(--foreground)" }}>
                  {p.title}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  {p.team}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-1.5 py-0.5 rounded-md font-500"
                      style={{ background: "#EEF2FF", color: C.indigo }}
                    >
                      {t}
                    </span>
                  ))}
                  <span className="ml-auto text-xs font-600" style={{ color: C.green }}>
                    {p.score}/100
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ─── Section 8: Placement Dashboard ─── */
const companyData = [
  { company: "Google", placed: 18, color: C.indigo },
  { company: "Microsoft", placed: 24, color: C.purple },
  { company: "Amazon", placed: 31, color: C.cyan },
  { company: "Infosys", placed: 52, color: C.green },
  { company: "TCS", placed: 48, color: C.amber },
  { company: "Wipro", placed: 39, color: "#F43F5E" },
];

const topRecruiters = [
  { name: "Infosys", logo: "IN", offers: 52, salary: "₹5.2L", type: "Mass" },
  { name: "TCS", logo: "TC", offers: 48, salary: "₹4.8L", type: "Mass" },
  { name: "Wipro", logo: "WI", offers: 39, salary: "₹5.0L", type: "Mass" },
  { name: "Microsoft", logo: "MS", offers: 24, salary: "₹28L", type: "Dream" },
  { name: "Amazon", logo: "AZ", offers: 31, salary: "₹22L", type: "Super Dream" },
];

function PlacementDashboard() {
  const pstats = [
    { label: "Internship Applications", value: "3,240", trend: "+12%", up: true },
    { label: "Placement Applications", value: "2,180", trend: "+8%", up: true },
    { label: "Interview Participation", value: "1,650", trend: "+15%", up: true },
    { label: "Placement Success Rate", value: "68%", trend: "+4%", up: true },
  ];

  return (
    <div className="mb-6">
      <SectionTitle title="Placement Dashboard" subtitle="Recruitment activity and outcomes" />
      <div className="grid grid-cols-4 gap-4 mb-4">
        {pstats.map((s) => (
          <Card key={s.label}>
            <div
              className="font-display font-700 mb-1"
              style={{ fontSize: "1.5rem", color: "var(--foreground)", lineHeight: 1.1 }}
            >
              {s.value}
            </div>
            <div className="text-sm" style={{ color: "var(--foreground)" }}>
              {s.label}
            </div>
            <span
              className="inline-flex items-center gap-1 text-xs font-500 mt-2"
              style={{ color: s.up ? "#059669" : "#F43F5E" }}
            >
              {s.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {s.trend} this semester
            </span>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-600 mb-4" style={{ color: "var(--foreground)" }}>
            Company-wise Placement
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={companyData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,70,229,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="company"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="placed" name="Placed" radius={[0, 6, 6, 0]}>
                {companyData.map((c, i) => (
                  <Cell key={`company-cell-${i}`} fill={c.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="text-sm font-600 mb-4" style={{ color: "var(--foreground)" }}>
            Top Recruiters
          </div>
          <div className="space-y-3">
            {topRecruiters.map((r) => (
              <div key={r.name} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-700"
                  style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})` }}
                >
                  {r.logo}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-500" style={{ color: "var(--foreground)" }}>
                    {r.name}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {r.offers} offers · {r.salary} avg
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-500"
                  style={{
                    background:
                      r.type === "Dream"
                        ? "#EEF2FF"
                        : r.type === "Super Dream"
                        ? "#F5F3FF"
                        : "#F0FDF4",
                    color:
                      r.type === "Dream"
                        ? C.indigo
                        : r.type === "Super Dream"
                        ? C.purple
                        : C.green,
                  }}
                >
                  {r.type}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── Section 9: AI Insights Panel ─── */
const aiInsights = [
  {
    icon: TrendingUp,
    color: C.rose,
    bg: "#FFF1F2",
    title: "Engagement Drop Detected",
    body: "Student engagement drops by 18% during examination periods. Recommend scheduling wellness check-ins proactively.",
    tag: "Behavioral",
  },
  {
    icon: Award,
    color: C.green,
    bg: "#ECFDF5",
    title: "Top Performing Department",
    body: "IT Department has the highest placement readiness score at 91%. Key factor: consistent project submissions.",
    tag: "Achievement",
  },
  {
    icon: Brain,
    color: C.indigo,
    bg: "#EEF2FF",
    title: "Interview Preparation Gap",
    body: "Final year students need additional support in mock interviews. Only 34% have completed at least 3 practice sessions.",
    tag: "Action Required",
  },
  {
    icon: Code,
    color: C.purple,
    bg: "#F5F3FF",
    title: "Coding Activity Surge",
    body: "GitHub commits up 32% in final year. Hackathon participation drives the spike — 240 students in active projects.",
    tag: "Positive Signal",
  },
  {
    icon: Building2,
    color: C.amber,
    bg: "#FFFBEB",
    title: "Department Gap Alert",
    body: "Civil Engineering shows lowest placement readiness at 55%. Recommend targeted skill workshops and industry exposure.",
    tag: "Intervention",
  },
  {
    icon: Cpu,
    color: C.cyan,
    bg: "#ECFEFF",
    title: "ML Skill Growth",
    body: "Machine learning course completions grew 42% YoY. Student-led study groups correlate with higher completion rates.",
    tag: "Insight",
  },
];

function AIInsightsPanel() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display" style={{ color: "var(--foreground)" }}>
            AI Insights Panel
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            StudentOS AI Administrator Assistant — real-time recommendations
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-500"
          style={{
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            color: "white",
          }}
        >
          <Brain size={14} />
          AI Active
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {aiInsights.map((insight) => {
          const Icon = insight.icon;
          return (
            <Card key={insight.title} className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: insight.bg }}
                >
                  <Icon size={16} style={{ color: insight.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-600" style={{ color: "var(--foreground)" }}>
                      {insight.title}
                    </span>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-500"
                    style={{ background: insight.bg, color: insight.color }}
                  >
                    {insight.tag}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {insight.body}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Dashboard Page ─── */
export function DashboardPage({ section }: { section?: string }) {
  if (section) {
    switch (section) {
      case "placement":
        return (
          <div>
            <PlacementDashboard />
          </div>
        );
      case "departments":
        return (
          <div>
            <DepartmentPerformance />
          </div>
        );
      case "academic":
        return (
          <div>
            <DepartmentPerformance />
            <AtRiskStudents />
          </div>
        );
      case "projects":
        return (
          <div>
            <ProjectAnalytics />
          </div>
        );
      default:
        return (
          <div>
            <OverviewCards />
          </div>
        );
    }
  }

  return (
    <div>
      <OverviewCards />
      <StudentSuccessCharts />
      <PlacementSection />
      <DepartmentPerformance />
      <AtRiskStudents />
      <ProjectAnalytics />
      <PlacementDashboard />
      <AIInsightsPanel />
    </div>
  );
}
