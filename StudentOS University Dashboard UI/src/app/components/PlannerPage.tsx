import { useState, useEffect } from "react";
import { 
  CheckCircle2, Clock3, Sparkles, Plus, Trash2, 
  Check, AlertCircle, Calendar, ChevronLeft, ChevronRight, ListTodo
} from "lucide-react";
import { apiRequest } from "../utils/api";

const C = {
  indigo: "#4F46E5",
  purple: "#8B5CF6",
  green: "#10B981",
  blue: "#3B82F6",
  amber: "#F59E0B",
  rose: "#EF4444"
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "General": { bg: "bg-indigo-50/90", text: "text-indigo-800", border: "border-indigo-200" },
  "Assignment": { bg: "bg-emerald-50/90", text: "text-emerald-800", border: "border-emerald-200" },
  "Project": { bg: "bg-violet-50/90", text: "text-violet-800", border: "border-violet-200" },
  "Exam": { bg: "bg-amber-50/90", text: "text-amber-800", border: "border-amber-200" },
  "Placement Prep": { bg: "bg-rose-50/90", text: "text-rose-800", border: "border-rose-200" },
  "Personal Study": { bg: "bg-blue-50/90", text: "text-blue-800", border: "border-blue-200" }
};

export function PlannerPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  });

  // Form states for adding tasks
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("General");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskStartTime, setTaskStartTime] = useState("09:00");
  const [taskDuration, setTaskDuration] = useState("60");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskImpact, setTaskImpact] = useState("5");

  // Inline add slot states
  const [inlineAddSlot, setInlineAddSlot] = useState<{ date: Date; hour: number; colIdx: number; top: number } | null>(null);
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineCategory, setInlineCategory] = useState("General");

  const fetchPlannerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest("/api/student/planner-data");
      if (res.success) {
        setTasks(res.tasks);
        setEvents(res.events);
        setHistory(res.planHistory);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load planner data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate || !taskStartTime) return;

    try {
      const combinedDateTime = new Date(`${taskDueDate}T${taskStartTime}:00`);
      const res = await apiRequest("/api/student/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: taskTitle.trim(),
          category: taskCategory,
          dueDate: combinedDateTime.toISOString(),
          estimatedDurationMinutes: Number(taskDuration),
          priority: taskPriority,
          placementImpact: Number(taskImpact)
        })
      });

      if (res.success) {
        setTaskTitle("");
        setTaskDueDate("");
        setTaskStartTime("09:00");
        setShowAddForm(false);
        await fetchPlannerData();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create task.");
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    try {
      await apiRequest(`/api/student/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus })
      });
      await fetchPlannerData();
    } catch (err: any) {
      setError(err.message || "Failed to update task.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiRequest(`/api/student/tasks/${taskId}`, {
        method: "DELETE"
      });
      await fetchPlannerData();
    } catch (err: any) {
      setError(err.message || "Failed to delete task.");
    }
  };

  // Grid layout parameters
  const START_HOUR = 8;
  const END_HOUR = 21;
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  // Week days calculation
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + i);
    return d;
  });

  const handlePrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const handleToday = () => {
    const d = new Date();
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    start.setHours(0, 0, 0, 0);
    setCurrentWeekStart(start);
  };

  const handleGridSlotClick = (date: Date, hour: number, colIdx: number) => {
    const topOffset = (hour - START_HOUR) * 60;
    setInlineAddSlot({ date, hour, colIdx, top: topOffset });
    setInlineTitle("");
    setInlineCategory("General");
  };

  const handleInlineSubmit = async () => {
    if (!inlineTitle.trim() || !inlineAddSlot) return;

    try {
      const { date, hour } = inlineAddSlot;
      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(hour, 0, 0, 0);

      const res = await apiRequest("/api/student/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: inlineTitle.trim(),
          category: inlineCategory,
          dueDate: combinedDateTime.toISOString(),
          estimatedDurationMinutes: 60,
          priority: "Medium",
          placementImpact: 5
        })
      });

      if (res.success) {
        setInlineTitle("");
        setInlineAddSlot(null);
        await fetchPlannerData();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create task inline.");
    }
  };

  // Merge calendar events & tasks for single source of truth in schedule grid
  const calendarItems = [
    ...tasks.map(t => ({
      id: t._id,
      title: t.title,
      category: t.category,
      dueDate: new Date(t.dueDate),
      duration: t.estimatedDurationMinutes || 60,
      status: t.status,
      priority: t.priority,
      isTask: true
    })),
    ...events.filter(e => !e.linkedId).map(e => ({
      id: e._id,
      title: e.title,
      category: e.category,
      dueDate: new Date(e.dueDate),
      duration: e.durationMinutes || 60,
      status: e.status,
      priority: e.priority,
      isTask: false
    }))
  ];

  const formatMonthYearRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: "short", year: "numeric", day: "numeric" };
    return `${weekDays[0].toLocaleDateString("en-US", options)} - ${weekDays[6].toLocaleDateString("en-US", options)}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Synchronizing Calendar Scheduler...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Weekly Calendar Grid</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Workload Calendar Planner</h2>
          <p className="text-xs text-slate-500 mt-1">Schedule and position task blocks into hourly slots. Click any slot to schedule.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleToday}
            className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center border rounded-xl bg-slate-50">
            <button onClick={handlePrevWeek} className="p-2 text-slate-600 hover:text-slate-900 transition cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-xs font-bold text-slate-600 border-x py-2 min-w-[200px] text-center">
              {formatMonthYearRange()}
            </span>
            <button onClick={handleNextWeek} className="p-2 text-slate-600 hover:text-slate-900 transition cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs text-white transition hover:bg-indigo-700 font-bold shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Task Add Form Overlay */}
      {showAddForm && (
        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Create New Time-Slot Task</h3>
          <form onSubmit={handleAddTask} className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Task Title</label>
              <input type="text" placeholder="e.g. Practice SQL Joins" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category</label>
              <select value={taskCategory} onChange={e => setTaskCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                <option value="General">General (Study)</option>
                <option value="Assignment">Assignment</option>
                <option value="Project">Project</option>
                <option value="Exam">Exam</option>
                <option value="Placement Prep">Placement Prep</option>
                <option value="Personal Study">Personal Study</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Date</label>
              <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Start Time</label>
              <input type="time" value={taskStartTime} onChange={e => setTaskStartTime(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Estimated Duration (Mins)</label>
              <input type="number" placeholder="60" value={taskDuration} onChange={e => setTaskDuration(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Priority</label>
              <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Placement Impact (1-10)</label>
              <input type="number" min="1" max="10" placeholder="5" value={taskImpact} onChange={e => setTaskImpact(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" />
            </div>

            <div className="flex gap-2 justify-end pt-2 md:col-span-1">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-500 bg-white cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer">Schedule</button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid View */}
      <div className="w-full">
        
        {/* Google Calendar Grid Layout */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Header Row (Day labels) */}
          <div className="grid grid-cols-[60px_1fr] border-b pb-3 mb-2">
            <div className="text-xs text-slate-400 font-bold uppercase flex items-center justify-center">GMT</div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, idx) => {
                const dayStr = day.toLocaleDateString("en-US", { weekday: "short" });
                const dateNum = day.getDate();
                const isDayToday = isToday(day);

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{dayStr}</span>
                    <span className={`w-8 h-8 flex items-center justify-center mt-1 text-sm font-bold rounded-full transition-all ${
                      isDayToday 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                        : "text-slate-700 hover:bg-slate-100"
                    }`}>
                      {dateNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Slot Rows Scroll Area */}
          <div className="h-[600px] overflow-y-auto relative pr-1">
            <div className="grid grid-cols-[60px_1fr] relative" style={{ minHeight: `${hours.length * 60}px` }}>
              
              {/* Left Hour labels */}
              <div className="flex flex-col justify-between select-none" style={{ height: `${hours.length * 60}px` }}>
                {hours.map((hour) => {
                  const ampm = hour >= 12 ? "PM" : "AM";
                  const displayHour = hour > 12 ? hour - 12 : hour;
                  return (
                    <div key={hour} className="h-[60px] text-[10px] text-slate-400 font-semibold text-right pr-3 pt-1 border-r border-slate-100">
                      {displayHour} {ampm}
                    </div>
                  );
                })}
              </div>

              {/* Day columns containing hourly slot click zones & positioned cards */}
              <div className="grid grid-cols-7 gap-2 relative bg-slate-50/10">
                {weekDays.map((dayDate, colIdx) => {
                  // Filter items scheduled for this day
                  const dayItems = calendarItems.filter(item => {
                    return item.dueDate.toDateString() === dayDate.toDateString();
                  });

                  return (
                    <div key={colIdx} className="relative h-full border-r border-slate-100 last:border-r-0">
                      
                      {/* Clickable slot zones for pre-filling */}
                      {hours.map((h, rowIdx) => (
                        <div 
                          key={rowIdx} 
                          className="h-[60px] border-b border-slate-100/50 hover:bg-indigo-100/40 transition-colors duration-300 ease-out cursor-crosshair"
                          onClick={() => handleGridSlotClick(dayDate, h, colIdx)}
                          title={`Schedule task at ${h}:00`}
                        />
                      ))}

                      {/* Positioned task blocks */}
                      {dayItems.map((item, itemIdx) => {
                        const startHour = item.dueDate.getHours();
                        const startMin = item.dueDate.getMinutes();
                        
                        // Out of grid range guards
                        if (startHour < START_HOUR || startHour > END_HOUR) return null;

                        const topOffset = (startHour - START_HOUR) * 60 + startMin;
                        const durationMins = item.duration;
                        const heightSize = Math.max(30, durationMins); // min 30px height

                        const colors = categoryColors[item.category] || categoryColors.General;

                        return (
                          <div 
                            key={item.id || itemIdx}
                            className={`absolute left-[2%] w-[96%] rounded-xl p-2 border ${colors.bg} ${colors.border} shadow-sm overflow-hidden flex flex-col justify-between group transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] z-10 hover:z-20`}
                            style={{ 
                              top: `${topOffset}px`, 
                              height: `${heightSize}px`,
                              zIndex: 10
                            }}
                          >
                            <div className="overflow-hidden">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`truncate min-w-0 text-[9px] uppercase font-bold tracking-wider opacity-75 ${colors.text}`}>
                                  {item.category}
                                </span>
                                {item.isTask && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleTaskStatus(item.id, item.status);
                                    }}
                                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 transition-colors ${
                                      item.status === "Completed" ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-400 bg-white"
                                    }`}
                                  >
                                    {item.status === "Completed" && <Check size={8} />}
                                  </button>
                                )}
                              </div>
                              <h4 className={`text-[10px] font-bold leading-tight mt-0.5 ${
                                item.status === "Completed" ? "line-through text-slate-400" : colors.text
                              }`}>
                                {item.title}
                              </h4>
                            </div>
                            
                            {/* Card Hover Details */}
                            {heightSize >= 50 && (
                              <div className="flex items-center justify-between text-[8px] text-slate-400 mt-1 border-t border-slate-100/50 pt-1 group-hover:block hidden">
                                <span>{item.duration}m</span>
                                {item.isTask && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTask(item.id);
                                    }}
                                    className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Inline Add Task Popover */}
                      {inlineAddSlot && inlineAddSlot.colIdx === colIdx && (
                        <div 
                          className="absolute z-50 bg-slate-900 border border-slate-700/60 p-4 rounded-2xl shadow-2xl text-slate-100 flex flex-col gap-3 w-[260px] animate-in fade-in zoom-in-95 duration-100"
                          style={{ 
                            top: `${Math.min(inlineAddSlot.top, hours.length * 60 - 150)}px`, 
                            left: colIdx >= 5 ? '-270px' : '102%' 
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="text-[10px] font-bold text-slate-400">
                              Schedule · {inlineAddSlot.hour}:00
                            </span>
                            <button 
                              type="button"
                              onClick={() => setInlineAddSlot(null)} 
                              className="text-slate-400 hover:text-white text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Task title..."
                            value={inlineTitle}
                            onChange={(e) => setInlineTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleInlineSubmit();
                            }}
                          />

                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={inlineCategory}
                              onChange={(e) => setInlineCategory(e.target.value)}
                              className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-slate-200 focus:outline-none"
                            >
                              <option value="General">Study</option>
                              <option value="Assignment">Assignment</option>
                              <option value="Project">Project</option>
                              <option value="Exam">Exam</option>
                              <option value="Placement Prep">Placement Prep</option>
                              <option value="Personal Study">Prep</option>
                            </select>

                            <button
                              type="button"
                              onClick={handleInlineSubmit}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition shadow-md shadow-indigo-600/10 cursor-pointer"
                            >
                              Schedule
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PlannerPage;
