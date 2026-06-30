import { useState, useEffect } from "react";
import { 
  CalendarDays, CheckCircle2, Clock3, Sparkles, Plus, Trash2, 
  Check, AlertCircle, Calendar, Play
} from "lucide-react";
import { apiRequest } from "../utils/api";

export function PlannerPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for adding tasks
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("General");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDuration, setTaskDuration] = useState("60");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskImpact, setTaskImpact] = useState("5");

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
    if (!taskTitle.trim() || !taskDueDate) return;

    try {
      const res = await apiRequest("/api/student/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: taskTitle.trim(),
          category: taskCategory,
          dueDate: taskDueDate,
          estimatedDurationMinutes: Number(taskDuration),
          priority: taskPriority,
          placementImpact: Number(taskImpact)
        })
      });

      if (res.success) {
        setTaskTitle("");
        setTaskDueDate("");
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

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Synchronizing Adaptive Planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Adaptive Planner</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Adaptive Planning Calendar</h2>
          <p className="text-xs text-slate-500 mt-1">Calendar automatically adapts workloads on missed, completed, or new placement deadlines.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm text-white transition hover:bg-indigo-700 font-semibold"
        >
          <Plus size={16} /> New Task
        </button>
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
          <h3 className="text-sm font-bold text-slate-800 mb-4">Create New Adaptable Event Task</h3>
          <form onSubmit={handleAddTask} className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Task Title</label>
              <input type="text" placeholder="e.g. Practise SQL Join queries" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category</label>
              <select value={taskCategory} onChange={e => setTaskCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                <option value="General">General</option>
                <option value="Assignment">Assignment</option>
                <option value="Project">Project</option>
                <option value="Exam">Exam</option>
                <option value="Placement Prep">Placement Prep</option>
                <option value="Personal Study">Personal Study</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Due Date</label>
              <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Estimated Duration (Mins)</label>
              <input type="number" placeholder="60" value={taskDuration} onChange={e => setTaskDuration(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" />
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
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Placement Impact weight (1-10)</label>
              <input type="number" min="1" max="10" placeholder="5" value={taskImpact} onChange={e => setTaskImpact(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" />
            </div>

            <div className="flex gap-2 justify-end sm:col-span-2 md:col-span-3 pt-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-500 bg-white">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700">Schedule Task</button>
            </div>
          </form>
        </div>
      )}

      {/* Main planner grid */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        
        {/* Calendar Events (Integrated timeline) */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar size={18} className="text-indigo-600" />
              Calendar Timeline
            </h3>
            <span className="text-xs text-slate-400">Recalculated dynamically</span>
          </div>

          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Your calendar timeline is currently empty.</p>
            ) : (
              events.map((event) => (
                <div key={event._id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800">{event.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="font-semibold text-slate-500">{event.category}</span>
                      <span>·</span>
                      <span>Scheduled: {new Date(event.dueDate).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{event.durationMinutes} mins</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-bold ${
                      event.status === "Pending" ? "bg-slate-100 text-slate-600" :
                      event.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Planning updates & Tasks checklist */}
        <div className="space-y-6">
          {/* AI Plan Summary Card */}
          {history && (
            <div className="rounded-3xl p-5 bg-indigo-950 text-indigo-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-indigo-400" />
                <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Plan Analysis</span>
              </div>
              <p className="text-xs leading-relaxed text-indigo-200">{history.reasoning}</p>
              <div className="mt-4 pt-3 border-t border-indigo-900 text-[0.7rem] text-indigo-400 flex items-center justify-between">
                <span>Trigger Reason:</span>
                <span className="font-medium text-white">{history.triggerEvent}</span>
              </div>
            </div>
          )}

          {/* Core Tasks Checklist */}
          <div className="rounded-3xl bg-white p-5 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Adaptable Action Checklist</h3>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No tasks found. Click "New Task" above.</p>
              ) : (
                tasks.map((task) => (
                  <div key={task._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleToggleTaskStatus(task._id, task.status)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          task.status === "Completed" ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 hover:border-indigo-400"
                        }`}
                      >
                        {task.status === "Completed" && <Check size={12} />}
                      </button>
                      <div>
                        <h4 className={`text-xs font-semibold ${task.status === "Completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {task.title}
                        </h4>
                        <p className="text-[0.65rem] text-slate-400 mt-0.5">Impact Score: {task.placementImpact}/10 · Priority: {task.priority}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-slate-300 hover:text-rose-500 transition shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PlannerPage;
