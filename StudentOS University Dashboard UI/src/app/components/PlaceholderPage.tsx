import { Construction } from "lucide-react";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-80 gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "#EEF2FF" }}
      >
        <Construction size={28} style={{ color: "#4F46E5" }} />
      </div>
      <div className="text-center">
        <h2 className="font-display" style={{ color: "var(--foreground)" }}>
          {title}
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          This section is under active development. Coming soon.
        </p>
      </div>
    </div>
  );
}
