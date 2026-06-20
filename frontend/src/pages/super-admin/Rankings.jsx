import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { HiOutlineArrowPath, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { Card, CardHeader, Tier } from "../../components/common/Page.jsx";
import { getRankings, recalculateRankings } from "../../api/rankings";
import { getStates, getDistricts } from "../../api/schools";
import { toast } from "sonner";

const tierTone = {
  Platinum: "text-slate-200 border-slate-400",
  Gold: "text-amber-400 border-amber-500",
  Silver: "text-slate-300 border-slate-400",
  Bronze: "text-orange-400 border-orange-500",
  "Not Ranked": "text-muted-foreground border-border",
};

export default function Rankings() {
  const [rankingsList, setRankingsList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [rankingType, setRankingType] = useState("National"); // "National", "State", "District"

  const [tiers, setTiers] = useState([
    { label: "Platinum", count: 0, color: "#8b5cf6" },
    { label: "Gold", count: 0, color: "#f59e0b" },
    { label: "Silver", count: 0, color: "#94a3b8" },
    { label: "Bronze", count: 0, color: "#f97316" },
    { label: "Not Ranked", count: 0, color: "#808080" },
  ]);

  const fetchRankingsData = async () => {
    try {
      const [rankingsRes, statesRes, districtsRes] = await Promise.all([
        getRankings(),
        getStates(),
        getDistricts()
      ]);

      if (statesRes.success) setStatesList(statesRes.data || []);
      if (districtsRes.success) setDistrictsList(districtsRes.data || []);

      if (rankingsRes.success && Array.isArray(rankingsRes.data)) {
        setRankingsList(rankingsRes.data);
        
        // Aggregate tiers
        const counts = {
          "Platinum": 0,
          "Gold": 0,
          "Silver": 0,
          "Bronze": 0,
          "Not Ranked": 0,
        };

        rankingsRes.data.forEach((r) => {
          const tierName = r.RankTier?.tier_name || r.RankTier?.name || "Not Ranked";
          const normalized = counts[tierName] !== undefined ? tierName : "Not Ranked";
          counts[normalized] += 1;
        });

        setTiers([
          { label: "Platinum", count: counts["Platinum"], color: "#8b5cf6" },
          { label: "Gold", count: counts["Gold"], color: "#f59e0b" },
          { label: "Silver", count: counts["Silver"], color: "#94a3b8" },
          { label: "Bronze", count: counts["Bronze"], color: "#f97316" },
          { label: "Not Ranked", count: counts["Not Ranked"], color: "#808080" },
        ]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load rankings and geographic scopes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankingsData();
  }, []);

  const handleRecalculate = async () => {
    try {
      toast.loading("Recalculating school scores & tiers...", { id: "recalc" });
      const res = await recalculateRankings();
      if (res.success) {
        toast.success("Rankings recalculated successfully!", { id: "recalc" });
        fetchRankingsData();
      }
    } catch (err) {
      toast.error(err.message || "Recalculation failed", { id: "recalc" });
    }
  };

  const getScoreByCategory = (components, categoryName) => {
    if (!components || !Array.isArray(components)) return 0;
    const comp = components.find(c => c.ScoreCategory?.category_name === categoryName);
    return comp ? comp.score : 0;
  };

  // Reset district filter if state filter changes
  const handleStateFilterChange = (e) => {
    setStateFilter(e.target.value);
    setDistrictFilter("All");
  };

  // Filtered districts list for the cascading dropdown
  const filteredDistrictsForDropdown = districtsList.filter(
    (d) => stateFilter === "All" || String(d.state_id) === stateFilter
  );

  // Unique region options for the region dropdown
  const regionOptions = Array.from(new Set(statesList.map(s => s.state_name))).sort();

  // Apply filters
  const filteredRankings = rankingsList.filter((r) => {
    const school = r.School;
    const district = school?.District;
    const state = district?.State;
    const tierName = r.RankTier?.tier_name || r.RankTier?.name || "Not Ranked";
    const regionalAdmin = state?.RegionalAdminScopes?.[0]?.User;
    const regionalAdminName = regionalAdmin
      ? `${regionalAdmin.first_name} ${regionalAdmin.last_name || ""}`.trim()
      : "";

    // Search query matches school name or school code
    const matchesSearch =
      !q.trim() ||
      (school?.school_name || "").toLowerCase().includes(q.toLowerCase()) ||
      (school?.school_code || "").toLowerCase().includes(q.toLowerCase());

    const matchesState = stateFilter === "All" || String(state?.id) === stateFilter;
    const matchesDistrict = districtFilter === "All" || String(district?.id) === districtFilter;
    
    // Region maps to the State name or Admin coverage
    const matchesRegion =
      regionFilter === "All" ||
      state?.state_name === regionFilter ||
      (regionalAdminName && regionalAdminName.toLowerCase().includes(regionFilter.toLowerCase()));

    const matchesTier =
      tierFilter === "All" ||
      tierName.toLowerCase() === tierFilter.toLowerCase();

    return matchesSearch && matchesState && matchesDistrict && matchesRegion && matchesTier;
  });

  const sortedRankings = [...filteredRankings].sort((a, b) => {
    let valA, valB;
    if (rankingType === "National") {
      valA = a.global_rank;
      valB = b.global_rank;
    } else if (rankingType === "State") {
      valA = a.state_rank;
      valB = b.state_rank;
    } else {
      valA = a.district_rank;
      valB = b.district_rank;
    }
    if (!valA && !valB) return 0;
    if (!valA) return 1;
    if (!valB) return -1;
    return valA - valB;
  });

  const renderRankChange = (change) => {
    if (change > 0) return <span className="text-emerald-400 font-semibold font-mono text-xs">▲ +{change}</span>;
    if (change < 0) return <span className="text-rose-400 font-semibold font-mono text-xs">▼ {change}</span>;
    return <span className="text-muted-foreground font-mono text-xs">-</span>;
  };

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading School Rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {tiers.map((t) => (
          <div key={t.label} className="rounded-2xl border border-border bg-surface p-5 text-center">
            <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full border-2 text-sm font-bold ${tierTone[t.label] || "text-muted-foreground border-border"}`}>
              {t.count}
            </div>
            <p className="mt-3 font-semibold text-foreground">{t.label}</p>
            <p className="text-[11px] text-muted-foreground">schools</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        {/* Left Side: Distribution & Search Filters */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="Ranking Distribution" />
            <div className="h-48 px-5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tiers} dataKey="count" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {tiers.map((t, i) => <Cell key={i} fill={t.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 p-5 pt-0 text-xs">
              {tiers.map((t) => (
                <div key={t.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                    {t.label}
                  </span>
                  <span className="font-semibold text-foreground">{t.count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 space-y-4 text-left">
            <h3 className="text-sm font-bold text-foreground">Filter & Search Controls</h3>
            
            <div className="space-y-3">
              {/* School Search */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">School Search</label>
                <div className="relative">
                  <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by school name/code…"
                    className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* State Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">State</label>
                <select
                  value={stateFilter}
                  onChange={handleStateFilterChange}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="All">All States</option>
                  {statesList.map((st) => (
                    <option key={st.id} value={String(st.id)}>
                      {st.state_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Filter (Cascading) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">District</label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  disabled={stateFilter === "All" && filteredDistrictsForDropdown.length === 0}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="All">All Districts</option>
                  {filteredDistrictsForDropdown.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.district_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Region</label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="All">All Regions</option>
                  {regionOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rank Tier Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rank Category</label>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="All">All Tiers</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Not Ranked">No Rank</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Rankings Table */}
        <Card>
          <CardHeader 
            title={`${rankingType} School Rankings`} 
            subtitle="Calculated live based on inspections, achievements, media, and participation scores"
            action={
              <button 
                onClick={handleRecalculate}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg cursor-pointer hover:opacity-90 animate-pulse border-0"
              >
                <HiOutlineArrowPath className="h-3.5 w-3.5" /> Recalculate Tiers
              </button>
            }
          />
          <div className="px-6 pb-2">
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1 w-fit">
              {["National", "State", "District"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setRankingType(mode)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer border-0 ${
                    rankingType === mode ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground bg-transparent"
                  }`}
                >
                  {mode} Ranking
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto text-left">
            <table className="w-full min-w-[1200px] text-sm">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-3 text-left">Global Rank</th>
                  <th className="px-4 py-3 text-left">State Rank</th>
                  <th className="px-4 py-3 text-left">District Rank</th>
                  <th className="px-4 py-3 text-left">School Name</th>
                  <th className="px-4 py-3 text-left">State</th>
                  <th className="px-4 py-3 text-left">District</th>
                  <th className="px-4 py-3 text-center">Total Score</th>
                  <th className="px-4 py-3 text-left">Tier Name</th>
                  <th className="px-4 py-3 text-center">Rank Change</th>
                </tr>
              </thead>
              <tbody>
                {sortedRankings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No matching rankings found.
                    </td>
                  </tr>
                ) : (
                  sortedRankings.map((r) => {
                    const school = r.School;
                    const district = school?.District;
                    const state = district?.State;

                    return (
                      <tr key={r.id} className="border-t border-border hover:bg-white/5 transition">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">
                          #{r.global_rank || "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-medium text-muted-foreground">
                          #{r.state_rank || "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-medium text-muted-foreground">
                          #{r.district_rank || "-"}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{school?.school_name || "Unknown School"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{state?.state_name || "N/A"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{district?.district_name || "N/A"}</td>
                        <td className="px-4 py-3 text-center font-bold text-foreground font-mono text-xs">
                          {r.total_score || 0} pts
                        </td>
                        <td className="px-4 py-3">
                          <Tier value={r.RankTier?.tier_name || r.RankTier?.name || "Not Ranked"} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {renderRankChange(r.rank_change)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
