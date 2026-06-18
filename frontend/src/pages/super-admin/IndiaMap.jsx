import { useState, useEffect } from "react";
import { HiOutlineMagnifyingGlass, HiChevronDown } from "react-icons/hi2";
import { Card, CardHeader, Tier } from "../../components/common/Page.jsx";
import SchoolNetworkChart from "../../components/Charts/SchoolNetworkChart.jsx";
import { getStates, getSchools } from "../../api/schools";
import { getRegionalAdmins } from "../../api/security";
import { toast } from "sonner";

export default function IndiaMap() {
  const [stateList, setStateList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
            tier: active > 5 ? "Platinum" : active > 2 ? "Gold" : active > 0 ? "Silver" : "Bronze"
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

  const filteredStates = stateList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading Geographic Network Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader
          title="India School Network Map"
          subtitle="Real-time map outline with pulsing geographic state coordinates"
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
              <button className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted cursor-pointer">
                All India <HiChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          }
        />
        <div className="px-5 pb-5">
          <SchoolNetworkChart />
        </div>
      </Card>

      <Card>
        <CardHeader title="State-wise Schools" />
        <div className="max-h-170 space-y-2 overflow-y-auto px-5 pb-5">
          {filteredStates.map((s, idx) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 shadow-sm hover:bg-muted transition">
              <div>
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
      </Card>
    </div>
  );
}
