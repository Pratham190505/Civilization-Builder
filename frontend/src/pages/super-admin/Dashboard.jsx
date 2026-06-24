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
import { useState, useEffect } from "react";
import { getNationalAnalytics } from "../../api/analytics";
import { getSchools } from "../../api/schools";
import { getAuditLogs } from "../../api/security";
import { getMediaList } from "../../api/media";

const quickActions = [
  { label: "Add Regional Admin", icon: "plus", tone: "blue", href: "/regional-admins" },
  { label: "Approve Pending Media", icon: "check", tone: "green", href: "/media-approvals" },
  { label: "View India Map", icon: "map", tone: "blue", href: "/india-map" },
  { label: "Send Announcement", icon: "megaphone", tone: "amber", href: "/messages" },
  { label: "Manage Permissions", icon: "shield", tone: "violet", href: "/users-roles" },
];

const tierColors = {
  active: "#10b981",
  inactive: "#ef4444",
  platinum: "#8b5cf6",
  gold: "#f59e0b",
  silver: "#94a3b8",
  bronze: "#f97316",
};

const legendItems = [
  { label: "ACTIVE", color: tierColors.active },
  { label: "INACTIVE", color: tierColors.inactive },
  { label: "PLATINUM", color: tierColors.platinum },
  { label: "GOLD", color: tierColors.gold },
  { label: "SILVER", color: tierColors.silver },
  { label: "BRONZE", color: tierColors.bronze },
];

function formatTimeAgo(dateStr) {
  if (!dateStr) return "Just now";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [topStates, setTopStates] = useState([]);
  const [liveActivity, setLiveActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSchools, setTotalSchools] = useState(0);
  const [pendingMediaCount, setPendingMediaCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const analyticsRes = await getNationalAnalytics();
        const schoolsRes = await getSchools();
        const logsRes = await getAuditLogs(1, 6);
        const mediaRes = await getMediaList();

        let activeCount = 0;
        let pendingCount = 0;
        let rejectedCount = 0;
        let totalCount = 0;

        if (schoolsRes.success) {
          const schools = schoolsRes.data;
          totalCount = schools.length;
          activeCount = schools.filter((s) => s.status === "APPROVED").length;
          pendingCount = schools.filter((s) => s.status === "PENDING").length;
          rejectedCount = schools.filter((s) => s.status === "REJECTED").length;
        }

        const mediaCount = mediaRes.success ? mediaRes.data?.length : 0;
        const pendingMediaCount = mediaRes.success
          ? mediaRes.data?.filter((s) => s.status === "REGIONAL_REVIEWED" || s.status === "SUBMITTED").length
          : 0;

        setStats([
          { key: "total", label: "Total Schools", value: totalCount.toLocaleString(), sub: "IN THE SYSTEM", delta: "", trend: "up", tone: "blue", icon: "building" },
          { key: "active", label: "Active Schools", value: activeCount.toLocaleString(), sub: `${totalCount ? Math.round((activeCount / totalCount) * 100) : 0}% ACTIVE RATE`, delta: "", trend: "up", tone: "green", icon: "check" },
          { key: "pending", label: "Pending Onboarding", value: pendingCount.toLocaleString(), sub: "AWAITING APPROVAL", delta: "", trend: "down", tone: "amber", icon: "clock" },
          { key: "approved", label: "Media Uploads", value: mediaCount.toLocaleString(), sub: "TOTAL POSTS", delta: "", trend: "up", tone: "violet", icon: "film" },
          { key: "rejected", label: "Rejected Schools", value: rejectedCount.toLocaleString(), sub: "ONBOARDING DENIED", delta: "", trend: "up", tone: "red", icon: "x" },
        ]);
        setTotalSchools(totalCount);
        setPendingMediaCount(pendingMediaCount);

        if (schoolsRes.success) {
          const stateCounts = {};
          schoolsRes.data.forEach((s) => {
            const stateName = s.District?.State?.state_name || s.District?.State?.name || "Unknown";
            if (!stateCounts[stateName]) {
              stateCounts[stateName] = { name: stateName, total: 0, active: 0, totalScoreSum: 0, activeWithScoreCount: 0 };
            }
            stateCounts[stateName].total += 1;
            if (s.status === "APPROVED") {
              stateCounts[stateName].active += 1;
              const schoolScore = s.total_score !== undefined ? s.total_score : (s.score || 0);
              stateCounts[stateName].totalScoreSum += schoolScore;
              stateCounts[stateName].activeWithScoreCount += 1;
            }
          });

          const sortedStates = Object.values(stateCounts)
            .map((item) => {
              const avgScore = item.activeWithScoreCount > 0 ? (item.totalScoreSum / item.activeWithScoreCount) : 0;
              let tier = "BRONZE";
              if (avgScore >= 700) tier = "PLATINUM";
              else if (avgScore >= 500) tier = "GOLD";
              else if (avgScore >= 300) tier = "SILVER";
              
              return {
                name: item.name,
                schools: item.total,
                active: item.active,
                avgScore: avgScore,
                tier: tier
              };
            })
            .sort((a, b) => b.avgScore - a.avgScore)
            .slice(0, 4)
            .map((item, idx) => ({
              rank: idx + 1,
              ...item
            }));
          setTopStates(sortedStates);
        }

        if (logsRes.success && logsRes.data?.logs) {
          const mappedLogs = logsRes.data.logs.map((log) => {
            const timeAgo = formatTimeAgo(log.created_at || log.timestamp);
            let icon = "plus";
            let tone = "blue";
            if (log.action.toLowerCase().includes("approve")) {
              icon = "check";
              tone = "green";
            } else if (log.action.toLowerCase().includes("reject")) {
              icon = "x";
              tone = "red";
            } else if (log.action.toLowerCase().includes("media")) {
              icon = "upload";
              tone = "amber";
            }
            return {
              id: log.id,
              icon,
              tone,
              title: `${log.action} - ${log.User?.first_name || "System"}`,
              time: timeAgo,
            };
          });
          setLiveActivity(mappedLogs);
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-background text-foreground rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading Dashboard Metrics...</p>
        </div>
      </div>
    );
  }

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
              BY PERFORMANCE SCORE
            </p>
            <div className="mt-2 divide-y divide-border">
              {topStates.length > 0 ? (
                topStates.map((s) => (
                  <TopStateRow key={s.rank} {...s} />
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground italic">
                  No Data Available
                </div>
              )}
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
                {pendingMediaCount} pending
              </span>
            </div>
            <PendingMediaTable />
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="text-base font-semibold text-foreground">Rankings</h3>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">
              {totalSchools.toLocaleString()} TOTAL SCHOOLS
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
