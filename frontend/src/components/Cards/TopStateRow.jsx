const tierColors = {
  PLATINUM: { text: "text-violet-500", bar: "bg-violet-500" },
  GOLD: { text: "text-amber-500", bar: "bg-amber-500" },
  SILVER: { text: "text-slate-400", bar: "bg-slate-400" },
  BRONZE: { text: "text-orange-500", bar: "bg-orange-500" },
};

export default function TopStateRow({ rank, name, schools, tier, active, avgScore }) {
  const t = tierColors[tier] || tierColors.SILVER;
  const activePercent = schools > 0 ? Math.round((active / schools) * 100) : 0;
  return (
    <div className="py-3">
      <div className="flex items-start gap-3">
        <span className="mt-1 text-xs font-semibold text-muted-foreground">#{rank}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold tracking-wider ${t.text}`}>{tier}</span>
              <span className="text-[11px] font-mono text-muted-foreground font-semibold">({Math.round(avgScore || 0)} pts)</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground mt-0.5">
            <span>{schools} total schools</span>
            <span>{active} active</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${activePercent}%` }} />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">{activePercent}% active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
