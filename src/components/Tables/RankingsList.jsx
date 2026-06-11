import { rankings } from "../../data/mockData.js";

export default function RankingsList() {
  return (
    <div className="space-y-3">
      {rankings.map((r) => (
        <div key={r.tier}>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-foreground">{r.tier}</span>
            <span className="text-sm font-semibold text-foreground">
              {r.count} <span className="ml-1 text-xs font-medium text-muted-foreground">{r.pct}%</span>
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(r.pct * 2.4, 100)}%`, background: r.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
