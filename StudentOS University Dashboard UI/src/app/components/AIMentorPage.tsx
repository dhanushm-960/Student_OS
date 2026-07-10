import { useState, useEffect } from "react";
import { Send, Sparkles, LifeBuoy, Star, MessageSquare, HelpCircle, Loader2, ListTodo, Check, Trash2 } from "lucide-react";
import { apiRequest } from "../utils/api";

const suggestedPrompts = [
  "How should I prepare for my next AI interview?",
  "Create a study plan for the next 7 days.",
  "Suggest resources for SQL and database design.",
  "Help me improve my DSA problem-solving skills.",
];

const quickActions = [
  { title: "Generate weekly study plan", description: "AI mentor creates a schedule for today through Sunday." },
  { title: "Review placement checklist", description: "Check resume, applications, and interview readiness." },
  { title: "Build skill roadmap", description: "Map the next steps for a new technical skill." },
];

const initialMessages = [
  { id: 1, role: "assistant", text: "Hi! I’m your StudentOS AI Mentor — ask me anything about your study schedules, recruiter matches, project milestones, or placement preparation." },
];

export function AIMentorPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const [history, setHistory] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchPlannerData = async () => {
    try {
      const res = await apiRequest("/api/student/planner");
      if (res.success) {
        if (res.aiHistory && res.aiHistory.length > 0) {
          setHistory(res.aiHistory[0]);
        }
        
        const allTasks = [
          ...(res.planner.todayTasks || []),
          ...(res.planner.upcomingTasks || []),
          ...(res.planner.missedTasks || []),
          ...(res.planner.completedTasks || [])
        ];
        
        allTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setTasks(allTasks);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    try {
      await apiRequest(`/api/student/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });
      fetchPlannerData();
    } catch (err: any) {
      console.error("Failed to update task", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await apiRequest(`/api/student/tasks/${taskId}`, { method: "DELETE" });
      fetchPlannerData();
    } catch (err: any) {
      console.error("Failed to delete task", err);
    }
  };

  async function handleSend(textToSend?: string) {
    const rawText = (textToSend || input).trim();
    if (!rawText || thinking) return;

    const userMsg = { id: Date.now(), role: "user", text: rawText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));

      const data = await apiRequest("/api/student/ai-mentor/chat", {
        method: "POST",
        body: JSON.stringify({
          message: rawText,
          history: historyPayload
        })
      });

      if (data.success && data.reply) {
        const botMsg = { id: Date.now() + 1, role: "assistant", text: data.reply };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error("Invalid reply format");
      }
    } catch (err) {
      console.error(err);
      const botErrorMsg = { 
        id: Date.now() + 1, 
        role: "assistant", 
        text: "I am experiencing network difficulties right now. Please verify your connection or try again shortly." 
      };
      setMessages((prev) => [...prev, botErrorMsg]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_0.7fr]">
      <div className="space-y-6">
        <div className="rounded-3xl bg-white/95 border border-slate-200/70 p-5 shadow-sm shadow-slate-950/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">AI Mentor</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Personalized study and career guidance</h2>
            </div>
            <div className="rounded-3xl bg-indigo-50 p-3 text-indigo-600">
              <Sparkles size={28} />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">Use chat for instant help on assignments, interview prep, and skills growth.</p>
        </div>

        <div className="rounded-3xl bg-white/95 border border-slate-200/70 p-5 shadow-sm shadow-slate-950/5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Suggested questions</p>
              <p className="text-xs text-slate-400">Tap one to ask instantly.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              <HelpCircle size={14} /> Quick prompts
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="rounded-3xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                disabled={thinking}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white/95 border border-slate-200/70 p-5 shadow-sm shadow-slate-950/5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">Learning suggestions</p>
              <p className="text-xs text-slate-400">Based on your current goals.</p>
            </div>
            <Star size={18} className="text-amber-500" />
          </div>
          <div className="space-y-4">
            {quickActions.map((action) => (
              <div 
                key={action.title} 
                className="rounded-3xl border border-slate-200 p-4 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition"
                onClick={() => handleSend(action.title)}
              >
                <p className="font-semibold text-slate-900">{action.title}</p>
                <p className="mt-1 text-sm text-slate-500">{action.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Plan reasoning */}
        {history && (
          <div className="rounded-3xl p-5 bg-indigo-950 text-indigo-100 shadow-sm shadow-slate-950/5">
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


      </div>

      <div className="space-y-6">
        <div className="rounded-3xl bg-white/95 border border-slate-200/70 p-5 shadow-sm shadow-slate-950/5 flex flex-col min-h-[500px] justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-sm font-semibold text-slate-500">Chat session</p>
                <p className="text-xs text-slate-400">Ask your AI Mentor anything.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Active</div>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-3xl p-4 max-w-full whitespace-pre-wrap ${message.role === "assistant" ? "bg-slate-50 text-slate-900" : "bg-indigo-600 text-white self-end"}`}
                >
                  <p className="text-sm leading-6">{message.text}</p>
                </div>
              ))}
              {thinking && (
                <div className="rounded-3xl p-4 max-w-full bg-slate-50 text-slate-500 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                  <span className="text-xs font-semibold">AI Mentor is thinking...</span>
                </div>
              )}
            </div>
          </div>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="mt-4 flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-900 outline-none"
              placeholder="Ask a question..."
              disabled={thinking}
            />
            <button
              type="submit"
              disabled={thinking || !input.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AIMentorPage;
