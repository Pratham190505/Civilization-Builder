const tierColors = {
  PLATINUM: { text: "text-violet-500", bar: "bg-violet-500" },
  GOLD: { text: "text-amber-500", bar: "bg-amber-500" },
  SILVER: { text: "text-slate-400", bar: "bg-slate-400" },
  BRONZE: { text: "text-orange-500", bar: "bg-orange-500" },
};

export default function TopStateRow({ rank, name, schools, tier, active }) {
  const t = tierColors[tier] || tierColors.SILVER;
  return (
    <div className="py-3">
      <div className="flex items-start gap-3">
        <span className="mt-1 text-xs font-semibold text-muted-foreground">#{rank}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            <span className={`text-[11px] font-bold tracking-wider ${t.text}`}>{tier}</span>
          </div>
          <p className="text-xs text-muted-foreground">{schools} schools</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${active}%` }} />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">{active}% active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
