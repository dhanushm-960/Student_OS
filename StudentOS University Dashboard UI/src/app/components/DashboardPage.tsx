import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import {
  Users, TrendingUp, Target, Zap, ArrowUpRight, ArrowDownRight,
  Brain, AlertTriangle, CheckCircle, Star, Code, Cpu, BookOpen,
  FolderGit2, Award, Building2, ChevronRight
} from "lucide-react";
import { apiRequest } from "../utils/api";

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
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      onClick={onClick}
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
function OverviewCards({ onNavigate, kpisData }: { onNavigate?: (page: string) => void; kpisData?: any }) {
  if (!kpisData) return null;

  const kpis = [
    {
      label: "Total Students",
      value: kpisData.totalStudents || "0",
      trend: "+3.2%",
      up: true,
      icon: Users,
      color: C.indigo,
      bg: "#EEF2FF",
      sub: "Across all departments",
    },
    {
      label: "Active Users",
      value: kpisData.activeUsers || "0",
      trend: "+5.8%",
      up: true,
      icon: Zap,
      color: C.purple,
      bg: "#F5F3FF",
      sub: "Last 30 days",
    },
    {
      label: "Placement Readiness",
      value: kpisData.placementReadiness || "0%",
      trend: "+2.1%",
      up: true,
      icon: Target,
      color: C.green,
      bg: "#ECFDF5",
      sub: "Final year students",
    },
    {
      label: "Student Engagement",
      value: kpisData.studentEngagement || "0%",
      trend: "-0.4%",
      up: false,
      icon: TrendingUp,
      color: C.amber,
      bg: "#FFFBEB",
      sub: "Platform engagement rate",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const handleClick = () => {
          if (!onNavigate) return;
          if (kpi.label === "Total Students") onNavigate("students");
          else if (kpi.label === "Active Users") onNavigate("academic");
          else if (kpi.label === "Placement Readiness") onNavigate("placement");
          else if (kpi.label === "Student Engagement") onNavigate("academic");
        };
        return (
          <Card
            key={kpi.label}
            className="relative overflow-hidden cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all duration-200"
            onClick={handleClick}
          >
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
const GOAL_COLORS = [C.indigo, C.cyan, "#E5E7EB"];

function StudentSuccessCharts({ monthlyData, goalData, productivityData }: { monthlyData?: any[]; goalData?: any[]; productivityData?: any[] }) {
  if (!monthlyData || !goalData || !productivityData) return null;

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
function PlacementSection({ placementStats, dsaData }: { placementStats?: any; dsaData?: any[] }) {
  if (!placementStats || !dsaData) return null;

  const stats = [
    { label: "Placement Ready", value: placementStats.placementReady || "0", pct: 78, color: C.indigo },
    { label: "Internship Ready", value: placementStats.internshipReady || "0", pct: 85, color: C.purple },
    { label: "Resume Completion", value: placementStats.resumeCompletion || "0", pct: 91, color: C.green },
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
                  <Cell key={`dsa-cell-${i}`} fill={[C.indigo, C.purple, C.cyan, C.green][i % 4]} />
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
            Recent updates: final year placements are tracking <span className="text-white font-600">higher readiness</span> across engineering, up {placementStats.placementReady ? "14%" : "0%"}.
          </p>
          <div className="space-y-2">
            {[
              `Resume workshops completed for ${placementStats.resumeCompletion || 0} students`,
              `Mock interviews targeted: ${placementStats.placementReady || 0} students ready`,
              `Average GPA of candidates: ${placementStats.avgGpa || "0.0"}/10.0`,
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
function DepartmentPerformance({ deptData, rankedDepts }: { deptData?: any[]; rankedDepts?: any[] }) {
  if (!deptData || !rankedDepts) return null;

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
            {rankedDepts.map((d) => (
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
const riskColors: Record<string, { bg: string; text: string }> = {
  High: { bg: "#FFF1F2", text: "#F43F5E" },
  Medium: { bg: "#FFFBEB", text: "#D97706" },
  Low: { bg: "#ECFDF5", text: "#059669" },
};

function AtRiskStudents({ atRiskStudents, placementStats }: { atRiskStudents?: any[]; placementStats?: any }) {
  if (!atRiskStudents) return null;

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
            <span className="font-600">AI Recommendation:</span> {placementStats?.atRiskCount || 0} students may require academic intervention this month. Immediate outreach suggested.
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
              {atRiskStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-sm text-slate-400">
                    No at-risk students currently detected. Excellent!
                  </td>
                </tr>
              ) : (
                atRiskStudents.map((s, i) => (
                  <tr
                    key={s.id || s.name}
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
                        style={{ color: parseInt(s.attendance) < 75 ? C.rose : "var(--foreground)" }}
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
                        style={riskColors[s.risk] || riskColors.Low}
                      >
                        {s.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="text-xs font-500 px-3 py-1 rounded-lg transition-colors"
                        style={{ color: C.indigo, background: "#EEF2FF" }}
                        onClick={() => alert(`Outreach email generated for ${s.name} (${s.dept})`)}
                      >
                        Reach Out
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ─── Section 6: Skill Development ─── */
function heatColor(val: number) {
  if (val >= 80) return { bg: "#312E81", text: "#C7D2FE" };
  if (val >= 65) return { bg: "#4F46E5", text: "white" };
  if (val >= 50) return { bg: "#818CF8", text: "white" };
  if (val >= 35) return { bg: "#C7D2FE", text: "#312E81" };
  return { bg: "#EEF2FF", text: "#6B7280" };
}

function SkillDevelopment({ skillData, heatmapData }: { skillData?: any[]; heatmapData?: any[] }) {
  if (!skillData || !heatmapData) return null;

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
function ProjectAnalytics({ projectStats, topProjects }: { projectStats?: any; topProjects?: any[] }) {
  if (!projectStats || !topProjects) return null;

  const stats = [
    { label: "Active Projects", value: projectStats.totalProjects, icon: FolderGit2, color: C.indigo, bg: "#EEF2FF" },
    { label: "Completed", value: projectStats.completedProjectsCount, icon: CheckCircle, color: C.green, bg: "#ECFDF5" },
    { label: "Collaboration Score", value: projectStats.collaborationScore, icon: Users, color: C.purple, bg: "#F5F3FF" },
    { label: "Innovation Index", value: projectStats.innovationIndex, icon: Star, color: C.amber, bg: "#FFFBEB" },
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
                  {p.tags && p.tags.map((t: string) => (
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
function PlacementDashboard({ companyData, topRecruiters }: { companyData?: any[]; topRecruiters?: any[] }) {
  if (!companyData || !topRecruiters) return null;

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
                  <Cell key={`company-cell-${i}`} fill={c.color || C.indigo} />
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
function AIInsightsPanel({ onNavigate, insights }: { onNavigate?: (page: string) => void; insights?: any[] }) {
  if (!insights) return null;

  // Map icons and colors dynamically
  const getIcon = (title: string) => {
    if (title.includes("Engagement")) return TrendingUp;
    if (title.includes("Performing")) return Award;
    if (title.includes("Interview")) return Brain;
    if (title.includes("Coding")) return Code;
    if (title.includes("Gap")) return Building2;
    return Cpu;
  };
  
  const getColors = (title: string) => {
    if (title.includes("Engagement")) return { color: C.rose, bg: "#FFF1F2" };
    if (title.includes("Performing")) return { color: C.green, bg: "#ECFDF5" };
    if (title.includes("Interview")) return { color: C.indigo, bg: "#EEF2FF" };
    if (title.includes("Coding")) return { color: C.purple, bg: "#F5F3FF" };
    if (title.includes("Gap")) return { color: C.amber, bg: "#FFFBEB" };
    return { color: C.cyan, bg: "#ECFEFF" };
  };

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
        {insights.map((insight) => {
          const Icon = getIcon(insight.title);
          const styles = getColors(insight.title);
          
          const handleClick = () => {
            if (!onNavigate) return;
            if (insight.title === "Engagement Drop Detected") onNavigate("academic");
            else if (insight.title === "Top Performing Department") onNavigate("departments");
            else if (insight.title === "Interview Preparation Gap") onNavigate("placement");
            else if (insight.title === "Coding Activity Surge") onNavigate("projects");
            else if (insight.title === "Department Gap Alert") onNavigate("departments");
            else if (insight.title === "ML Skill Growth") onNavigate("academic");
          };
          return (
            <Card
              key={insight.title}
              className="flex flex-col gap-3 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all duration-200"
              onClick={handleClick}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: styles.bg }}
                >
                  <Icon size={16} style={{ color: styles.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-600 text-slate-800" style={{ color: "var(--foreground)" }}>
                      {insight.title}
                    </span>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-500"
                    style={{ background: styles.bg, color: styles.color }}
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
export function DashboardPage({ section, onNavigate }: { section?: string; onNavigate?: (page: string) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest("/api/admin/dashboard-stats");
        if (active) {
          setStats(data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to load dashboard statistics.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchStats();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            <span className="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce" />
            <span className="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
          <span className="text-sm text-indigo-400 font-500 animate-pulse">Loading dashboard metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center font-medium">
        {error}
      </div>
    );
  }

  if (section) {
    switch (section) {
      case "placement":
        return (
          <div>
            <PlacementDashboard companyData={stats.companyData} topRecruiters={stats.topRecruiters} />
          </div>
        );
      case "departments":
        return (
          <div>
            <DepartmentPerformance deptData={stats.deptData} rankedDepts={stats.rankedDepts} />
          </div>
        );
      case "academic":
        return (
          <div>
            <DepartmentPerformance deptData={stats.deptData} rankedDepts={stats.rankedDepts} />
            <AtRiskStudents atRiskStudents={stats.atRiskStudents} placementStats={stats.placementStats} />
          </div>
        );
      case "projects":
        return (
          <div>
            <ProjectAnalytics projectStats={stats.projectStats} topProjects={stats.topProjects} />
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <OverviewCards onNavigate={onNavigate} kpisData={stats.kpis} />
            <StudentSuccessCharts 
              monthlyData={stats.monthlyData} 
              goalData={stats.goalData} 
              productivityData={stats.productivityData} 
            />
            <AIInsightsPanel onNavigate={onNavigate} insights={stats.aiInsights} />
          </div>
        );
    }
  }

  return (
    <div>
      <OverviewCards onNavigate={onNavigate} kpisData={stats.kpis} />
      <div className="h-6" />
      <StudentSuccessCharts 
        monthlyData={stats.monthlyData} 
        goalData={stats.goalData} 
        productivityData={stats.productivityData} 
      />
      <div className="h-6" />
      <PlacementSection placementStats={stats.placementStats} dsaData={stats.dsaData} />
      <div className="h-6" />
      <DepartmentPerformance deptData={stats.deptData} rankedDepts={stats.rankedDepts} />
      <div className="h-6" />
      <AtRiskStudents atRiskStudents={stats.atRiskStudents} placementStats={stats.placementStats} />
      <div className="h-6" />
      <ProjectAnalytics projectStats={stats.projectStats} topProjects={stats.topProjects} />
      <div className="h-6" />
      <PlacementDashboard companyData={stats.companyData} topRecruiters={stats.topRecruiters} />
      <div className="h-6" />
      <AIInsightsPanel onNavigate={onNavigate} insights={stats.aiInsights} />
    </div>
  );
}
