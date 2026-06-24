import { useState, useEffect } from "react";
import { HiOutlineMagnifyingGlass, HiChevronDown } from "react-icons/hi2";
import { Card, CardHeader, Tier } from "../../components/common/Page.jsx";
import { getStates, getSchools } from "../../api/schools";
import { getRegionalAdmins } from "../../api/security";
import { getStateAnalytics } from "../../api/analytics";
import { INDIA_PATHS } from "./indiaPaths";
import { toast } from "sonner";

export default function IndiaMap() {
  const [stateList, setStateList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState(null);
  const [stateAnalytics, setStateAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [tooltip, setTooltip] = useState({
    show: false,
    name: "",
    total: 0,
    active: 0,
    admins: 0,
    tier: "Bronze",
    x: 0,
    y: 0
  });

  const loadMapDetails = async () => {
    try {
      const [statesRes, schoolsRes, adminsRes] = await Promise.all([
        getStates(),
        getSchools(),
        getRegionalAdmins(),
      ]);

      if (statesRes.success && schoolsRes.success && adminsRes.success) {
        const states = statesRes.data || [];
        const schools = schoolsRes.data || [];
        const admins = adminsRes.data || [];

        const aggregated = states.map((st) => {
          const stateSchools = schools.filter(
            (s) => s.District?.State?.id === st.id || s.District?.state_id === st.id
          );
          const active = stateSchools.filter((s) => s.status === "APPROVED").length;
          const coordinators = admins.filter((a) => a.stateId === st.id).length;

          return {
            id: st.id,
            name: st.state_name,
            code: st.state_code,
            total: stateSchools.length,
            active,
            admins: coordinators,
            tier: active > 5 ? "Platinum" : active > 2 ? "Gold" : active > 0 ? "Silver" : "No Rank"
          };
        });

        // Sort by active schools descending to compute Rank
        const sorted = aggregated.sort((a, b) => b.active - a.active);
        setStateList(sorted);
      }
    } catch (err) {
      toast.error("Failed to load geographic state metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapDetails();
  }, []);

  const handleStateClick = async (path, stateData) => {
    setActiveTab("overview");
    const stateId = stateData ? stateData.id : null;
    setSelectedState({
      id: stateId,
      name: path.name,
      code: path.id
    });

    if (stateId) {
      try {
        setLoadingAnalytics(true);
        const res = await getStateAnalytics(stateId);
        if (res.success) {
          setStateAnalytics(res.data);
        } else {
          toast.error("Failed to load state analytics details");
          setStateAnalytics(null);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading state analytics");
        setStateAnalytics(null);
      } finally {
        setLoadingAnalytics(false);
      }
    } else {
      setStateAnalytics(null);
    }
  };

  const handleBackToAllStates = () => {
    setSelectedState(null);
    setStateAnalytics(null);
  };

  const handleMouseEnter = (e, path, stateData) => {
    setTooltip({
      show: true,
      name: path.name,
      total: stateData ? stateData.total : 0,
      active: stateData ? stateData.active : 0,
      admins: stateData ? stateData.admins : 0,
      tier: stateData ? stateData.tier : "Bronze",
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMove = (e) => {
    setTooltip((prev) => ({
      ...prev,
      x: e.clientX,
      y: e.clientY
    }));
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({
      ...prev,
      show: false
    }));
  };

  const filteredStates = stateList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-background text-foreground rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading Geographic Network Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px] text-left">
      <Card>
        <CardHeader
          title="India School Network Map"
          subtitle="Click a state to view local schools, region admins, inspection records, and performance rankings"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search state…"
                  className="w-36 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground focus:outline-none"
                />
              </div>
              <button 
                onClick={handleBackToAllStates}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
              >
                All India <HiChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          }
        />
        <div className="px-5 pb-5 relative">
          <div className="bg-[#0f172a]/20 border border-white/5 rounded-2xl p-4 overflow-hidden flex items-center justify-center min-h-[500px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 612 696"
              className="w-full h-auto max-h-[580px] mx-auto select-none"
              aria-label="Map of India"
            >
              {INDIA_PATHS.map((path) => {
                const stateData = stateList.find(
                  (s) => s.code.toLowerCase() === path.id.toLowerCase()
                );
                const isSelected =
                  selectedState &&
                  selectedState.code.toLowerCase() === path.id.toLowerCase();
                const hasSchools = stateData && stateData.active > 0;

                let fill = "rgba(255, 255, 255, 0.02)";
                if (hasSchools) {
                  const intensity = Math.min(stateData.active / 8, 1);
                  fill = `rgba(99, 102, 241, ${0.15 + intensity * 0.55})`;
                }
                if (isSelected) {
                  fill = "rgba(168, 85, 247, 0.8)";
                }

                return (
                  <path
                    key={path.id}
                    id={path.id}
                    d={path.d}
                    fill={fill}
                    stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.08)"}
                    strokeWidth={isSelected ? 1.8 : 0.8}
                    className="transition-all duration-200 cursor-pointer hover:stroke-purple-400 hover:fill-opacity-80"
                    onClick={() => handleStateClick(path, stateData)}
                    onMouseEnter={(e) => handleMouseEnter(e, path, stateData)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        {selectedState ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={handleBackToAllStates}
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-white/5 border border-border rounded-lg px-2.5 py-1.5 hover:bg-white/10"
              >
                ← Back to States
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground truncate" title={selectedState.name}>
                {selectedState.name}
              </h2>
              <p className="text-[11px] text-muted-foreground">State-scoped regional analytics report</p>
            </div>

            {selectedState.id === null ? (
              <div className="rounded-xl border border-border p-6 text-center text-xs text-muted-foreground bg-surface">
                No schools or administrative scopes are registered in {selectedState.name} yet.
              </div>
            ) : loadingAnalytics ? (
              <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
                Fetching live state metrics...
              </div>
            ) : stateAnalytics ? (
              <div className="space-y-4">
                {/* Tab Navigation */}
                <div className="flex border-b border-border">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "districts", label: `Districts (${stateAnalytics.districtPerformance?.length || 0})` },
                    { id: "rankings", label: `Rankings (${stateAnalytics.rankings?.length || 0})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 pb-2 text-center text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                        activeTab === tab.id
                          ? "border-purple-500 text-purple-400 font-bold"
                          : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                  {activeTab === "overview" && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-surface border border-border rounded-xl p-2.5">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Total Schools</p>
                          <p className="text-lg font-extrabold text-foreground mt-0.5">{stateAnalytics.metrics.totalSchools}</p>
                        </div>
                        <div className="bg-surface border border-border rounded-xl p-2.5">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Active Schools</p>
                          <p className="text-lg font-extrabold text-emerald-400 mt-0.5">{stateAnalytics.metrics.activeSchools}</p>
                        </div>
                        <div className="bg-surface border border-border rounded-xl p-2.5">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Approved Media</p>
                          <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{stateAnalytics.metrics.approvedMediaCount}</p>
                        </div>
                        <div className="bg-surface border border-border rounded-xl p-2.5">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Region Admins</p>
                          <p className="text-lg font-extrabold text-violet-400 mt-0.5">{stateAnalytics.metrics.regionAdminsCount}</p>
                        </div>
                      </div>

                      <div className="border border-border rounded-xl bg-surface p-3">
                        <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                          Assigned Region Admins ({stateAnalytics.regionAdmins.length})
                        </h4>
                        {stateAnalytics.regionAdmins.length > 0 ? (
                          <div className="space-y-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                            {stateAnalytics.regionAdmins.map((adm) => (
                              <div key={adm.id} className="text-xs border-b border-border pb-1.5 last:border-b-0 last:pb-0">
                                <p className="font-semibold text-foreground">
                                  {adm.first_name} {adm.last_name}
                                </p>
                                <p className="text-muted-foreground text-[10px]">{adm.email} · {adm.mobile || "No Mobile"}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No region admins assigned.</p>
                        )}
                      </div>

                      <div className="border border-border rounded-xl bg-surface p-3">
                        <h4 className="text-xs font-bold text-foreground mb-2.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Inspection Request Stats
                        </h4>
                        <div className="grid grid-cols-4 gap-1 text-center">
                          <div className="bg-white/5 rounded-lg py-1.5 px-0.5">
                            <p className="text-sm font-bold text-amber-400">{stateAnalytics.inspectionStats.PENDING}</p>
                            <p className="text-[8px] text-muted-foreground font-semibold">Pending</p>
                          </div>
                          <div className="bg-white/5 rounded-lg py-1.5 px-0.5">
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{stateAnalytics.inspectionStats.SCHEDULED}</p>
                            <p className="text-[8px] text-muted-foreground font-semibold">Sched</p>
                          </div>
                          <div className="bg-white/5 rounded-lg py-1.5 px-0.5">
                            <p className="text-sm font-bold text-emerald-400">{stateAnalytics.inspectionStats.COMPLETED}</p>
                            <p className="text-[8px] text-muted-foreground font-semibold">Compl</p>
                          </div>
                          <div className="bg-white/5 rounded-lg py-1.5 px-0.5">
                            <p className="text-sm font-bold text-rose-400">{stateAnalytics.inspectionStats.REJECTED}</p>
                            <p className="text-[8px] text-muted-foreground font-semibold">Rej</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "districts" && (
                    <div className="space-y-3">
                      {stateAnalytics.districtPerformance?.length > 0 ? (
                        stateAnalytics.districtPerformance.map((dp) => (
                          <div key={dp.District.id} className="border border-border rounded-xl bg-surface p-3 shadow-sm hover:border-purple-500/20 transition-all">
                            <div className="flex items-center justify-between mb-1.5">
                              <div>
                                <span className="font-semibold text-xs text-foreground block" title={dp.District.district_name}>
                                  {dp.District.district_name}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-mono">
                                  Code: {dp.District.district_code || 'N/A'}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded">
                                {dp.active_schools}/{dp.total_schools} Active
                              </span>
                            </div>
                            
                            {/* Visual progress bar of active/total */}
                            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden mb-2">
                              <div 
                                className="h-full rounded-full" 
                                style={{ 
                                  width: `${dp.total_schools > 0 ? (dp.active_schools / dp.total_schools) * 100 : 0}%`,
                                  backgroundColor: dp.color || '#3B82F6'
                                }} 
                              />
                            </div>

                            {/* Tier counts */}
                            <div className="flex flex-wrap gap-1 text-[9px] mt-1 pt-1.5 border-t border-border/40">
                              {dp.platinum > 0 && (
                                <span className="bg-slate-800 text-slate-200 border border-slate-700 px-1 py-0.5 rounded flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-[#E5E4E2]" /> Plat: {dp.platinum}
                                </span>
                              )}
                              {dp.gold > 0 && (
                                <span className="bg-amber-950/40 text-amber-300 border border-amber-800/30 px-1 py-0.5 rounded flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-amber-400" /> Gold: {dp.gold}
                                </span>
                              )}
                              {dp.silver > 0 && (
                                <span className="bg-slate-800 text-slate-300 border border-slate-600/30 px-1 py-0.5 rounded flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-slate-400" /> Silv: {dp.silver}
                                </span>
                              )}
                              {dp.bronze > 0 && (
                                <span className="bg-orange-950/30 text-orange-400 border border-orange-800/20 px-1 py-0.5 rounded flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-orange-600" /> Bron: {dp.bronze}
                                </span>
                              )}
                              {dp.notRanked > 0 && (
                                <span className="bg-white/5 text-slate-400 border border-white/5 px-1 py-0.5 rounded flex items-center gap-1">
                                  No Rank: {dp.notRanked}
                                </span>
                              )}
                              {dp.platinum === 0 && dp.gold === 0 && dp.silver === 0 && dp.bronze === 0 && dp.notRanked === 0 && (
                                <span className="text-muted-foreground italic">No rankings in this district yet</span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic text-center py-6">No district data available.</p>
                      )}
                    </div>
                  )}

                  {activeTab === "rankings" && (
                    <div className="space-y-2">
                      {stateAnalytics.rankings?.length > 0 ? (
                        stateAnalytics.rankings.map((rk) => (
                          <div key={rk.id} className="flex items-center justify-between border-b border-border pb-1.5 last:border-b-0 last:pb-0">
                            <div className="max-w-[70%]">
                              <p className="font-semibold text-xs text-foreground truncate" title={rk.School?.school_name}>
                                {rk.School?.school_name}
                              </p>
                              <p className="text-[9px] text-muted-foreground truncate">
                                State Rank: #{rk.state_rank} · Code: {rk.School?.school_code}
                              </p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <p className="text-xs font-bold text-foreground">{rk.total_score} pts</p>
                              <div className="scale-75 origin-right mt-0.5">
                                <Tier value={rk.RankTier?.tier_name || "No Rank"} />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic text-center py-6">No school rankings available.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-muted-foreground bg-surface border border-border rounded-xl">
                Failed to fetch analytics for {selectedState.name}.
              </div>
            )}
          </div>
        ) : (
          <div>
            <CardHeader title="State-wise Schools" />
            <div className="max-h-170 space-y-2 overflow-y-auto px-5 pb-5 scrollbar-thin">
              {filteredStates.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => {
                    const path = INDIA_PATHS.find((p) => p.id.toLowerCase() === s.code.toLowerCase());
                    if (path) handleStateClick(path, s);
                  }}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 shadow-sm hover:bg-muted transition cursor-pointer"
                >
                  <div className="text-left">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <span>{s.name}</span>
                      <span className="text-[10px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                        Rank #{idx + 1}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.active}/{s.total} active schools · {s.admins} admins
                    </p>
                  </div>
                  <Tier value={s.tier} />
                </div>
              ))}
              {filteredStates.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No states match your search query.
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {tooltip.show && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + 15,
            top: tooltip.y + 15,
            zIndex: 9999,
            pointerEvents: "none"
          }}
          className="rounded-xl border border-white/10 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-md text-xs min-w-[170px] animate-fade-in text-left text-white"
        >
          <p className="font-bold text-white text-sm mb-1.5 truncate max-w-[200px]" title={tooltip.name}>
            {tooltip.name}
          </p>
          <div className="space-y-1 text-slate-300 font-medium">
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Total Schools:</span>
              <span className="text-white">{tooltip.total}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Active Schools:</span>
              <span className="text-emerald-400">{tooltip.active}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Region Admins:</span>
              <span className="text-blue-600 dark:text-blue-400">{tooltip.admins}</span>
            </p>
            <p className="flex justify-between gap-4 items-center mt-2 pt-1.5 border-t border-white/5">
              <span className="text-slate-400">Rank Tier:</span>
              <Tier value={tooltip.tier} />
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

