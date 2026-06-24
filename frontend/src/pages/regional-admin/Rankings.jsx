import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getStateRankings, getRankTiers } from "../../api/rankings";
import {
  Trophy,
  Info,
  Award
} from "lucide-react";

// Category configuration
const categoryConfig = {
  Platinum: { color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)", stars: 5 },
  Gold: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", stars: 4 },
  Silver: { color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)", stars: 3 },
  Bronze: { color: "#CD7F32", bg: "rgba(205, 127, 50, 0.1)", stars: 2 },
  "No Rank": { color: "#94A3B8", bg: "rgba(148, 163, 184, 0.1)", stars: 1 },
};

// Stars component
function StarsRenderer({ count }) {
  return (
    <span style={{ letterSpacing: "1.5px" }} className="ml-1 inline-flex">
      {Array.from({ length: 5 }).map((_, r) => (
        <span
          key={r}
          style={{
            color: r < count ? "#F59E0B" : "var(--text-muted)",
            fontSize: "11px",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function Rankings() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [rankings, setRankings] = useState([]);
  const [dbTiers, setDbTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  const stateId = user?.scope?.stateId || (user?.scope?.stateIds && user.scope.stateIds[0]) || 1;

  useEffect(() => {
    async function fetchRankings() {
      try {
        const [res, tiersRes] = await Promise.all([
          getStateRankings(stateId),
          getRankTiers()
        ]);
        if (res.success) {
          setRankings(res.data);
        }
        if (tiersRes.success) {
          setDbTiers(tiersRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch state rankings / tiers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, [stateId]);

  const getTierName = (item) => {
    return item.RankTier?.tier_name || "No Rank";
  };

  const filteredRankings = activeCategory === "All"
    ? rankings
    : rankings.filter((item) => getTierName(item) === activeCategory);

  const rankedSchoolsCount = rankings.filter((item) => getTierName(item) !== "No Rank").length;
  const topRankedSchool = rankings[0]?.School;
  const platinumCount = rankings.filter((item) => getTierName(item) === "Platinum").length;
  const goldCount = rankings.filter((item) => getTierName(item) === "Gold").length;

  const statsConfig = [
    {
      title: "Total Ranked Schools",
      value: rankedSchoolsCount,
      color: "#3B82F6",
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Top Ranked School",
      value: topRankedSchool?.school_name || "-",
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.1)",
      small: true,
    },
    {
      title: "Platinum Schools",
      value: platinumCount,
      color: "#8B5CF6",
      bg: "rgba(139, 92, 246, 0.1)",
    },
    {
      title: "Gold Schools",
      value: goldCount,
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.1)",
    },
  ];

  const getRankBadge = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading State Rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 regional-admin-theme pb-8">
      {/* 1. Header description */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          School Rankings
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Performance rankings across your scoped state (view only)
        </p>
      </div>

      {/* 2. Notice Banner */}
      <div
        className="px-4 py-3 rounded-xl flex items-center gap-3"
        style={{
          background: "rgba(59, 130, 246, 0.05)",
          border: "1px solid rgba(59, 130, 246, 0.15)",
        }}
      >
        <Info className="w-4 h-4 shrink-0 text-[#3B82F6]" />
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Rankings are calculated dynamically based on score categories. State Admin has view-only access.
        </span>
      </div>

      {/* 3. Summary stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl p-4 flex flex-col justify-between"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: card.bg }}
            >
              <Trophy className="w-5 h-5" style={{ color: card.color }} />
            </div>
            <div>
              <div
                className={`${card.small ? "text-sm font-semibold truncate leading-tight mt-1" : "text-xl font-bold"} mb-0.5`}
                style={{ color: "var(--text-primary)" }}
              >
                {card.value}
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {card.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Filters switcher row */}
      <div className="flex gap-2 flex-wrap items-center">
        {(dbTiers.length > 0 ? ["All", ...dbTiers.map(t => t.tier_name)] : ["All", "Platinum", "Gold", "Silver", "Bronze", "No Rank"]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
            style={
              activeCategory === cat
                ? {
                    background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                    color: "#fff",
                    border: "1px solid transparent",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                  }
                : {
                    background: "var(--glass-card)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-secondary)",
                  }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 5. Rankings Table Container */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--glass-card)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(20px)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                {["Rank", "School Name", "District", "UDISE Code", "Principal Name", "Category", "Rating"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs whitespace-nowrap"
                      style={{ color: "var(--text-muted)", fontWeight: 600 }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredRankings.map((item) => {
                const tierName = getTierName(item);
                const category = categoryConfig[tierName] || categoryConfig["No Rank"];
                const trophy = getRankBadge(item.state_rank);

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[var(--glass-hover)]"
                    style={{ borderBottom: "1px solid var(--glass-border)" }}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        {trophy ? (
                          <span className="text-base leading-none">{trophy}</span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>#{item.state_rank}</span>
                        )}
                      </div>
                    </td>

                    {/* School Name */}
                    <td className="px-4 py-3.5">
                      <div
                        className="text-sm font-semibold flex items-center gap-1.5"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.School?.school_name}
                        {item.state_rank <= 3 && (
                          <Award className="w-3.5 h-3.5" style={{ color: "#F59E0B" }} />
                        )}
                      </div>
                    </td>

                    {/* District */}
                    <td className="px-4 py-3.5 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {item.School?.District?.district_name || "N/A"}
                    </td>

                    {/* UDISE Code */}
                    <td className="px-4 py-3.5 text-xs font-mono font-medium" style={{ color: "var(--text-secondary)" }}>
                      {item.School?.udise_code || "N/A"}
                    </td>

                    {/* Principal */}
                    <td className="px-4 py-3.5 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {item.School?.principal_name || "N/A"}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center"
                        style={{ background: category.bg, color: category.color }}
                      >
                        {tierName}
                      </span>
                    </td>

                    {/* Stars Rating */}
                    <td className="px-4 py-3.5">
                      <StarsRenderer count={category.stars} />
                    </td>
                  </tr>
                );
              })}
              {filteredRankings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No schools found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
