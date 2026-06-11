import {
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineFilm,
  HiOutlineXCircle,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
} from "react-icons/hi2";

const iconMap = {
  building: HiOutlineBuildingOffice2,
  check: HiOutlineCheckCircle,
  clock: HiOutlineClock,
  film: HiOutlineFilm,
  x: HiOutlineXCircle,
};

const toneMap = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500" },
  red: { bg: "bg-rose-500/10", text: "text-rose-500" },
};

export default function StatCard({ label, value, sub, delta, trend, tone, icon }) {
  const Icon = iconMap[icon];
  const t = toneMap[tone] || toneMap.blue;
  const up = trend === "up";
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${t.bg} ${t.text}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div
          className={`flex items-center gap-0.5 text-xs font-semibold ${
            up ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          {up ? (
            <HiArrowTrendingUp className="h-3.5 w-3.5" />
          ) : (
            <HiArrowTrendingDown className="h-3.5 w-3.5" />
          )}
          <span>{delta}</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-sm font-medium text-foreground/80">{label}</p>
        <p className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">
          {sub}
        </p>
      </div>
    </div>
  );
}
