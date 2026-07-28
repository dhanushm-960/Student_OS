import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, Bell, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest } from "../utils/api";

export function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Notification Toggles (Static for demo purposes)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [newJobMatches, setNewJobMatches] = useState(true);

  // Study Availability
  const [dailyHours, setDailyHours] = useState<number>(4);
  const [timeWindows, setTimeWindows] = useState<{startTime: string, endTime: string}[]>([{startTime: "18:00", endTime: "22:00"}]);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilitySuccess, setAvailabilitySuccess] = useState("");

  // Fetch initial profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiRequest("/api/student/profile");
        if (res.success && res.profile.studyAvailability) {
          setDailyHours(res.profile.studyAvailability.dailyHours || 4);
          if (res.profile.studyAvailability.timeWindows?.length > 0) {
            setTimeWindows(res.profile.studyAvailability.timeWindows);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.success) {
        setPasswordSuccess("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(res.message || "Failed to change password.");
      }
    } catch (err: any) {
      setPasswordError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAvailability = async () => {
    setAvailabilitySaving(true);
    setAvailabilitySuccess("");
    try {
      const res = await apiRequest("/api/student/profile", {
        method: "PUT",
        body: JSON.stringify({
          studyAvailability: {
            dailyHours,
            timeWindows
          }
        }),
      });
      if (res.success) {
        setAvailabilitySuccess("Study availability saved!");
        setTimeout(() => setAvailabilitySuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const addTimeWindow = () => {
    setTimeWindows([...timeWindows, { startTime: "12:00", endTime: "13:00" }]);
  };

  const removeTimeWindow = (index: number) => {
    const newWindows = [...timeWindows];
    newWindows.splice(index, 1);
    setTimeWindows(newWindows);
  };

  const updateTimeWindow = (index: number, field: "startTime" | "endTime", value: string) => {
    const newWindows = [...timeWindows];
    newWindows[index][field] = value;
    setTimeWindows(newWindows);
  };

  const totalWindowHours = timeWindows.reduce((acc, w) => {
    const start = w.startTime.split(":").map(Number);
    const end = w.endTime.split(":").map(Number);
    const diff = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
    return acc + Math.max(0, diff / 60);
  }, 0);

  return (
    <div className="max-w-3xl space-y-8">
      {/* Change Password Section */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-sm shadow-slate-950/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Security</h2>
            <p className="text-sm text-slate-500">Manage your password and security settings</p>
          </div>
        </div>

        {user?.authProvider === "google" ? (
          <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 flex items-center justify-center">
            <p className="text-slate-500 font-medium text-sm">
              Signed in with Google — no password to manage.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Must be at least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Re-enter new password"
              />
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl text-sm font-medium">
                <AlertCircle size={16} />
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl text-sm font-medium">
                <CheckCircle2 size={16} />
                {passwordSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </section>

      {/* Study Availability Section */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-sm shadow-slate-950/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/ বাতাসে" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Study Availability</h2>
            <p className="text-sm text-slate-500">Configure when the AI should schedule your daily learning.</p>
          </div>
        </div>

        <div className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Target Daily Hours
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-700">
                Time Windows
              </label>
              <button 
                onClick={addTimeWindow}
                className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
              >
                + Add Window
              </button>
            </div>
            
            <div className="space-y-3">
              {timeWindows.map((window, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="time"
                    value={window.startTime}
                    onChange={(e) => updateTimeWindow(index, "startTime", e.target.value)}
                    className="flex-1 rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="time"
                    value={window.endTime}
                    onChange={(e) => updateTimeWindow(index, "endTime", e.target.value)}
                    className="flex-1 rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={() => removeTimeWindow(index)}
                    disabled={timeWindows.length === 1}
                    className="p-2.5 text-slate-400 hover:text-rose-600 disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>

            {totalWindowHours < dailyHours && (
              <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl text-xs font-medium">
                <AlertCircle size={14} />
                Your total time windows ({totalWindowHours.toFixed(1)}h) are less than your daily goal ({dailyHours}h).
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveAvailability}
              disabled={availabilitySaving}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {availabilitySaving ? "Saving..." : "Save Availability"}
            </button>
            {availabilitySuccess && (
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> {availabilitySuccess}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Notification Preferences Section */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-sm shadow-slate-950/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
            <p className="text-sm text-slate-500">Decide what you want to be notified about</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div>
              <p className="font-semibold text-slate-900 text-sm">Email Alerts</p>
              <p className="text-xs text-slate-500 mt-0.5">Receive general account updates via email</p>
            </div>
            <button
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailAlerts ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailAlerts ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div>
              <p className="font-semibold text-slate-900 text-sm">New Job Matches</p>
              <p className="text-xs text-slate-500 mt-0.5">Get notified when new recruiters match your profile</p>
            </div>
            <button
              onClick={() => setNewJobMatches(!newJobMatches)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                newJobMatches ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  newJobMatches ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
