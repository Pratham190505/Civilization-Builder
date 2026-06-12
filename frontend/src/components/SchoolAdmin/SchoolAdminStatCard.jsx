import { TrendingUp, TrendingDown } from "lucide-react";

export default function SchoolAdminStatCard({
  label,
  value,
  change,
  positive,
  color,
  darkMode,
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:scale-[1.02]"
      style={{
        background: darkMode ? "rgba(255,255,255,0.04)" : "#fff",
        border: darkMode
          ? "1px solid rgba(255,255,255,0.07)"
          : "1px solid rgba(0,0,0,0.06)",
        boxShadow: darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <div className="w-5 h-5 rounded-full" style={{ background: color }} />
        </div>
        <span
          className="text-xs flex items-center gap-1 px-2 py-1 rounded-full font-medium"
          style={{
            background: positive
              ? "rgba(52,211,153,0.12)"
              : "rgba(239,68,68,0.12)",
            color: positive ? "#34d399" : "#ef4444",
          }}
        >
          {positive ? (
            <TrendingUp size={11} />
          ) : (
            <TrendingDown size={11} />
          )}
          {change}
        </span>
      </div>
      <div>
        <div
          className="font-bold"
          style={{
            color: darkMode ? "#e2e8f0" : "#0f172a",
            fontSize: "1.6rem",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div
          className="text-sm mt-1"
          style={{ color: darkMode ? "#8892a4" : "#64748b" }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
