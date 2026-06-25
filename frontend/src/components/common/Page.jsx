export function Card({ children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-border bg-surface shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 p-5 pb-3 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Tier({ value }) {
  const map = {
    Platinum: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    Gold: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Silver: "bg-slate-400/15 text-slate-300 border-slate-400/30",
    Bronze: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    "No Rank": "bg-white/5 text-muted-foreground border-border",
    Unranked: "bg-white/5 text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[value] || map["No Rank"]}`}>
      {value}
    </span>
  );
}

export function StatusPill({ value }) {
  const map = {
    Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    APPROVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Inactive: "bg-white/5 text-muted-foreground border-border",
    INACTIVE: "bg-white/5 text-muted-foreground border-border",
    Suspended: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    Pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    AWAITING_INSPECTION: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    "Awaiting Inspection": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    "Needs Review": "bg-rose-500/15 text-rose-400 border-rose-500/30",
    Connected: "text-emerald-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[value] || "border-border text-muted-foreground"}`}>
      {value === "Connected" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
      {(value === "Pending" || value === "PENDING") && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
      {(value === "AWAITING_INSPECTION" || value === "Awaiting Inspection") && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
      {value === "AWAITING_INSPECTION" ? "Awaiting Inspection" : value}
    </span>
  );
}
