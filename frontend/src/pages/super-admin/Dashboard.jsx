import {
  HiOutlineMagnifyingGlass,
  HiChevronDown,
  HiOutlineClock,
} from "react-icons/hi2";
import StatCard from "../../components/Cards/StatCard.jsx";
import TopStateRow from "../../components/Cards/TopStateRow.jsx";
import ActivityItem from "../../components/Cards/ActivityItem.jsx";
import QuickActionButton from "../../components/Cards/QuickActionButton.jsx";
import PendingMediaTable from "../../components/Tables/PendingMediaTable.jsx";
import RankingsList from "../../components/Tables/RankingsList.jsx";
import SchoolNetworkChart from "../../components/Charts/SchoolNetworkChart.jsx";
import {
  stats,
  topStates,
  liveActivity,
  quickActions,
  tierColors,
} from "../../data/mockData.js";

const legendItems = [
  { label: "ACTIVE", color: tierColors.active },
  { label: "INACTIVE", color: tierColors.inactive },
  { label: "PLATINUM", color: tierColors.platinum },
  { label: "GOLD", color: tierColors.gold },
  { label: "SILVER", color: tierColors.silver },
  { label: "BRONZE", color: tierColors.bronze },
];

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px]">
      {/* MAIN COLUMN */}
      <div className="space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((s) => (
            <StatCard key={s.key} {...s} />
          ))}
        </div>

        {/* Network + Top States */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">India School Network</h3>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">
                  29 STATES · LIVE ACTIVITY
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search state…"
                    className="w-36 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <button className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                  All India
                  <HiChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <SchoolNetworkChart />

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {legendItems.map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-[10px] font-bold tracking-[0.12em] text-muted-foreground">
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="text-base font-semibold text-foreground">Top States</h3>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">
              BY ACTIVE SCHOOLS
            </p>
            <div className="mt-2 divide-y divide-border">
              {topStates.map((s) => (
                <TopStateRow key={s.rank} {...s} />
              ))}
            </div>
          </section>
        </div>

        {/* Pending Media + Rankings */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between gap-3 p-5 pb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Pending Media Approval
                </h3>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">
                  REVIEW SCHOOL-UPLOADED REELS
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <HiOutlineClock className="h-3.5 w-3.5" />
                143 pending
              </span>
            </div>
            <PendingMediaTable />
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="text-base font-semibold text-foreground">Rankings</h3>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">
              1,248 TOTAL SCHOOLS
            </p>
            <div className="mt-4">
              <RankingsList />
            </div>
          </section>
        </div>
      </div>

      {/* RIGHT RAIL */}
      <aside className="space-y-5">
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-[0.15em] text-muted-foreground">
              LIVE ACTIVITY
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          </div>
          <div className="divide-y divide-border">
            {liveActivity.map((a) => (
              <ActivityItem key={a.id} {...a} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="mb-3 text-[11px] font-bold tracking-[0.15em] text-muted-foreground">
            QUICK ACTIONS
          </p>
          <div className="space-y-2">
            {quickActions.map((q) => (
              <QuickActionButton key={q.label} {...q} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="mb-3 text-[11px] font-bold tracking-[0.15em] text-muted-foreground">
            ADMIN CONTROL
          </p>
          <p className="text-xs text-muted-foreground">
            Super admin tools and overrides will appear here.
          </p>
        </section>
      </aside>
    </div>
  );
}
