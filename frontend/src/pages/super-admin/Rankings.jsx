import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { HiOutlineArrowPath, HiOutlineMagnifyingGlass, HiOutlineEye, HiXMark, HiOutlinePencilSquare } from "react-icons/hi2";
import { Card, CardHeader, Tier } from "../../components/common/Page.jsx";
import { getRankings, recalculateRankings, getRankTiers, getSchoolRankings } from "../../api/rankings";
import { getStates, getDistricts, updateSchool } from "../../api/schools";
import { toast } from "sonner";

const overlayStyle = {
  background: "var(--glass-card)",
  backdropFilter: "blur(24px)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--card-shadow)",
};

const tierTone = {
  Platinum: "text-slate-200 border-slate-400",
  Gold: "text-amber-400 border-amber-500",
  Silver: "text-slate-300 border-slate-400",
  Bronze: "text-orange-400 border-orange-500",
  "No Rank": "text-muted-foreground border-border",
};

export default function Rankings() {
  const [rankingsList, setRankingsList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // History Drawer State
  const [selectedSchoolHistory, setSelectedSchoolHistory] = useState(null);
  const [selectedSchoolName, setSelectedSchoolName] = useState("");
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Edit Scores Modal State
  const [showEditScoresModal, setShowEditScoresModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [editScoresData, setEditScoresData] = useState({
    academic_score: "0",
    achievement_score: "0",
    media_score: "0",
    participation_score: "0"
  });

  const handleOpenEditScores = (r) => {
    const school = r.School;
    setEditingSchool(school);
    setEditScoresData({
      academic_score: String(school?.academic_score || 0),
      achievement_score: String(school?.achievement_score || 0),
      media_score: String(school?.media_score || 0),
      participation_score: String(school?.participation_score || 0)
    });
    setShowEditScoresModal(true);
  };

  const handleSaveScores = async (e) => {
    e.preventDefault();
    try {
      toast.loading("Updating school scores...", { id: "edit-scores" });
      const academic = parseInt(editScoresData.academic_score || 0, 10);
      const achievement = parseInt(editScoresData.achievement_score || 0, 10);
      const media = parseInt(editScoresData.media_score || 0, 10);
      const participation = parseInt(editScoresData.participation_score || 0, 10);
      const totalScore = academic + achievement + media + participation;

      if (totalScore === 0) {
        toast.error("Total school score cannot be zero after inspection.", { id: "edit-scores" });
        return;
      }

      const res = await updateSchool(editingSchool.id, {
        academic_score: academic,
        achievement_score: achievement,
        media_score: media,
        participation_score: participation
      });

      if (res.success) {
        toast.success("School scores updated & rankings recalculated!", { id: "edit-scores" });
        setShowEditScoresModal(false);
        fetchRankingsData();
      } else {
        toast.error(res.message || "Failed to update scores", { id: "edit-scores" });
      }
    } catch (err) {
      toast.error(err.message || "An error occurred", { id: "edit-scores" });
    }
  };

  // Filter States
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [rankingType, setRankingType] = useState("National"); // "National", "State", "District"

  const [dbTiers, setDbTiers] = useState([]);
  const [tiers, setTiers] = useState([
    { label: "Platinum", count: 0, color: "#8b5cf6" },
    { label: "Gold", count: 0, color: "#f59e0b" },
    { label: "Silver", count: 0, color: "#94a3b8" },
    { label: "Bronze", count: 0, color: "#f97316" },
    { label: "No Rank", count: 0, color: "#808080" },
  ]);

  const fetchRankingsData = async () => {
    try {
      const [rankingsRes, statesRes, districtsRes, tiersRes] = await Promise.all([
        getRankings(),
        getStates(),
        getDistricts(),
        getRankTiers()
      ]);

      if (statesRes.success) setStatesList(statesRes.data || []);
      if (districtsRes.success) setDistrictsList(districtsRes.data || []);

      if (rankingsRes.success && Array.isArray(rankingsRes.data)) {
        setRankingsList(rankingsRes.data);
        
        // Aggregate tiers dynamically
        const fetchedTiersList = (tiersRes && tiersRes.success && Array.isArray(tiersRes.data))
          ? tiersRes.data
          : [
              { tier_name: "Platinum", min_score: 90, max_score: 100 },
              { tier_name: "Gold", min_score: 75, max_score: 89 },
              { tier_name: "Silver", min_score: 60, max_score: 74 },
              { tier_name: "Bronze", min_score: 40, max_score: 59 },
              { tier_name: "No Rank", min_score: 0, max_score: 39 }
            ];

        setDbTiers(fetchedTiersList);

        const counts = {};
        fetchedTiersList.forEach(t => {
          counts[t.tier_name] = 0;
        });

        rankingsRes.data.forEach((r) => {
          const tierName = r.RankTier?.tier_name || r.RankTier?.name || "No Rank";
          if (counts[tierName] !== undefined) {
            counts[tierName] += 1;
          } else {
            const matched = fetchedTiersList.find(t => t.tier_name === tierName);
            if (matched) {
              counts[tierName] = (counts[tierName] || 0) + 1;
            } else {
              counts["No Rank"] = (counts["No Rank"] || 0) + 1;
            }
          }
        });

        const colorMap = {
          Platinum: "#8b5cf6",
          Gold: "#f59e0b",
          Silver: "#94a3b8",
          Bronze: "#f97316",
          "No Rank": "#808080"
        };

        setTiers(
          fetchedTiersList.map(t => ({
            label: t.tier_name,
            count: counts[t.tier_name] || 0,
            color: t.color || colorMap[t.tier_name] || "#808080"
          }))
        );
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

  const handleViewHistory = async (schoolId, schoolName) => {
    setSelectedSchoolName(schoolName);
    setShowHistoryDrawer(true);
    setLoadingHistory(true);
    setSelectedSchoolHistory(null);
    try {
      const res = await getSchoolRankings(schoolId);
      if (res.success && res.data) {
        setSelectedSchoolHistory(res.data);
      } else {
        toast.error("Failed to load school ranking history");
        setShowHistoryDrawer(false);
      }
    } catch (err) {
      toast.error("Error loading ranking history: " + err.message);
      setShowHistoryDrawer(false);
    } finally {
      setLoadingHistory(false);
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
    const tierName = r.RankTier?.tier_name || r.RankTier?.name || "No Rank";
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
      <div className="grid h-48 place-items-center bg-background text-foreground rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading School Rankings...</p>
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
                  {(dbTiers.length > 0 ? dbTiers : [
                    { tier_name: "Platinum" },
                    { tier_name: "Gold" },
                    { tier_name: "Silver" },
                    { tier_name: "Bronze" },
                    { tier_name: "No Rank" }
                  ]).map((t) => (
                    <option key={t.tier_name} value={t.tier_name}>
                      {t.tier_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Rankings Table */}
        <Card>
          <div className="sticky top-[64px] z-20 bg-surface border-b border-border">
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
            <div className="px-6 pb-3">
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
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-340px)] min-h-[300px] text-left">
            <table className="w-full min-w-[1400px] text-sm">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground border-b border-border bg-muted/20">
                  <th className="px-4 py-3 text-left">Global Rank</th>
                  <th className="px-4 py-3 text-left">Prev Rank</th>
                  <th className="px-4 py-3 text-center">Change</th>
                  <th className="px-4 py-3 text-left">School Name</th>
                  <th className="px-4 py-3 text-left">State</th>
                  <th className="px-4 py-3 text-left">District</th>
                  <th className="px-4 py-3 text-center">Academic</th>
                  <th className="px-4 py-3 text-center">Achievement</th>
                  <th className="px-4 py-3 text-center">Media</th>
                  <th className="px-4 py-3 text-center">Participation</th>
                  <th className="px-4 py-3 text-center font-bold">Total Score</th>
                  <th className="px-4 py-3 text-left">Tier Name</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedRankings.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="px-4 py-8 text-center text-xs text-muted-foreground">
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
                          {r.previous_rank ? `#${r.previous_rank}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {renderRankChange(r.rank_change)}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{school?.school_name || "Unknown School"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{state?.state_name || "N/A"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{district?.district_name || "N/A"}</td>
                        
                        <td className="px-4 py-3 text-center font-semibold text-foreground/80 font-mono text-xs">
                          {school?.academic_score || 0}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-foreground/80 font-mono text-xs">
                          {school?.achievement_score || 0}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-foreground/80 font-mono text-xs">
                          {school?.media_score || 0}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-foreground/80 font-mono text-xs">
                          {school?.participation_score || 0}
                        </td>
                        
                        <td className="px-4 py-3 text-center font-bold text-blue-600 dark:text-blue-400 font-mono text-xs">
                          {r.total_score || 0} pts
                        </td>
                        <td className="px-4 py-3">
                          <Tier value={r.RankTier?.tier_name || r.RankTier?.name || "No Rank"} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewHistory(r.school_id, school?.school_name || "School")}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:bg-primary/20 bg-primary/10 text-primary border-none cursor-pointer"
                            >
                              <HiOutlineEye className="w-3.5 h-3.5" />
                              <span>History</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditScores(r)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:bg-amber-500/20 bg-amber-500/10 text-amber-500 border-none cursor-pointer"
                            >
                              <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                              <span>Edit Score & Rank</span>
                            </button>
                          </div>
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

      {/* History Drawer */}
      {showHistoryDrawer && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[4px] transition-all"
            onClick={() => setShowHistoryDrawer(false)}
          />

          <div
            className="fixed right-0 top-0 h-full w-[520px] max-w-full z-50 flex flex-col bg-surface shadow-2xl animate-slide-in text-foreground border-l border-border"
            style={{
              background: "var(--glass-card)",
              backdropFilter: "blur(24px)",
              borderLeft: "1px solid var(--glass-border)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-background/50">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Ranking Performance History
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedSchoolName}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent"
              >
                <HiXMark className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
              {loadingHistory ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                  <p className="text-xs text-slate-400">Loading historical timeline...</p>
                </div>
              ) : (
                <>
                  {/* Monthly Rank History Graph */}
                  <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Rank Trend</h4>
                    
                    {(!selectedSchoolHistory?.history || selectedSchoolHistory.history.length === 0) ? (
                      <div className="text-center py-6 text-xs text-muted-foreground">
                        Not enough historical data points to plot trend.
                      </div>
                    ) : (
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={selectedSchoolHistory.history.slice().reverse().map(h => ({
                              date: new Date(h.calculated_at || h.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
                              "Global Rank": h.global_rank || 0,
                              "Total Score": Number(h.total_score) || 0
                            }))}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                            <Tooltip contentStyle={{ background: "var(--glass-card)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Line type="monotone" dataKey="Total Score" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="Global Rank" stroke="#10B981" strokeWidth={2} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* History List Table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Historical Audit Milestones</h4>
                    
                    {(!selectedSchoolHistory?.history || selectedSchoolHistory.history.length === 0) ? (
                      <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                        No previous rank changes recorded in history.
                      </div>
                    ) : (
                      <div className="overflow-hidden border border-border rounded-xl bg-muted/10 text-xs">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-background/50 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
                              <th className="px-4 py-3">Audit Date</th>
                              <th className="px-4 py-3">Rank Tier</th>
                              <th className="px-4 py-3 text-center">Score</th>
                              <th className="px-4 py-3">Global Rank</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {selectedSchoolHistory.history.map((hist) => (
                              <tr key={hist.id} className="hover:bg-white/5 transition">
                                <td className="px-4 py-3 text-muted-foreground">
                                  {new Date(hist.calculated_at || hist.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  })}
                                </td>
                                <td className="px-4 py-3 font-semibold text-foreground">
                                  <Tier value={hist.RankTier?.tier_name || "No Rank"} />
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-center text-blue-600 dark:text-blue-400">
                                  {hist.total_score} pts
                                </td>
                                <td className="px-4 py-3 font-mono font-medium text-foreground">
                                  #{hist.global_rank || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit Scores Modal */}
      {showEditScoresModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-[2px]">
          <div className="w-full max-w-lg p-6 rounded-2xl space-y-5" style={overlayStyle}>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Edit School Score & Rank</h3>
                <p className="text-xs text-muted-foreground">{editingSchool?.school_name}</p>
              </div>
              <button
                onClick={() => setShowEditScoresModal(false)}
                className="border-none bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveScores} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                    <span>Academic Score</span>
                    <span className="text-[10px] opacity-75">Max 300</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    required
                    value={editScoresData.academic_score}
                    onChange={(e) => setEditScoresData(prev => ({ ...prev, academic_score: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border border-border bg-surface text-foreground font-semibold animate-none"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                    <span>Achievements Score</span>
                    <span className="text-[10px] opacity-75">Max 300</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    required
                    value={editScoresData.achievement_score}
                    onChange={(e) => setEditScoresData(prev => ({ ...prev, achievement_score: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border border-border bg-surface text-foreground font-semibold animate-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                    <span>Media Score</span>
                    <span className="text-[10px] opacity-75">Max 300</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    required
                    value={editScoresData.media_score}
                    onChange={(e) => setEditScoresData(prev => ({ ...prev, media_score: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border border-border bg-surface text-foreground font-semibold animate-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                    <span>Participation Score</span>
                    <span className="text-[10px] opacity-75">Max 100</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={editScoresData.participation_score}
                    onChange={(e) => setEditScoresData(prev => ({ ...prev, participation_score: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border border-border bg-surface text-foreground font-semibold animate-none"
                  />
                </div>
              </div>

              {/* Total points and tier preview */}
              <div className="rounded-xl p-4 flex items-center justify-between border border-border bg-muted/30">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calculated Rating</div>
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                    {parseInt(editScoresData.academic_score || 0, 10) +
                     parseInt(editScoresData.achievement_score || 0, 10) +
                     parseInt(editScoresData.media_score || 0, 10) +
                     parseInt(editScoresData.participation_score || 0, 10)} / 1000 Points
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Matching Tier</div>
                  <div className="mt-0.5">
                    {(() => {
                      const total = parseInt(editScoresData.academic_score || 0, 10) +
                                    parseInt(editScoresData.achievement_score || 0, 10) +
                                    parseInt(editScoresData.media_score || 0, 10) +
                                    parseInt(editScoresData.participation_score || 0, 10);
                      const matched = dbTiers.find(t => total >= t.min_score && total <= t.max_score);
                      return <Tier value={matched ? matched.tier_name : "No Rank"} />;
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEditScoresModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-muted-foreground bg-transparent hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer border-none"
                  style={{ background: "linear-gradient(135deg, var(--color-primary, #3B82F6), #6366F1)" }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
