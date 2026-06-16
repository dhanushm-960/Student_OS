import React from "react";

export function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) {
  return (
    <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/10 flex items-start gap-3 hover:shadow-lg transition-shadow">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
        <div className="text-white">{icon}</div>
      </div>
      <div>
        <div className="text-sm font-600" style={{ color: "var(--foreground)" }}>{title}</div>
        <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{description}</div>
      </div>
    </div>
  );
}

export default FeatureCard;
