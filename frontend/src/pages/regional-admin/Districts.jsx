import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDistricts, getSchools } from "../../api/schools";
import {
  Map,
  Search,
  Eye,
  Pen
} from "lucide-react";

export default function Districts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [districtsList, setDistrictsList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const stateId = user?.scope?.stateId || (user?.scope?.stateIds && user.scope.stateIds[0]) || 1;

  useEffect(() => {
    async function loadData() {
      try {
        const [districtsRes, schoolsRes] = await Promise.all([
          getDistricts(),
          getSchools()
        ]);
        if (districtsRes.success) {
          setDistrictsList(districtsRes.data);
        }
        if (schoolsRes.success) {
          setSchoolsList(schoolsRes.data);
        }
      } catch (err) {
        console.error("Failed to load districts details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter districts list based on state scope
  const scopedDistricts = districtsList.filter(d => !stateId || d.state_id === stateId);

  // Map district schools and status dynamically
  const mappedDistricts = scopedDistricts.map(d => {
    const districtSchools = schoolsList.filter(s => s.district_id === d.id);
    const activeSchools = districtSchools.filter(s => s.status === "APPROVED");

    let platinumCount = 0;
    let goldCount = 0;
    let silverCount = 0;
    let bronzeCount = 0;

    activeSchools.forEach(s => {
      const score = s.total_score !== null && s.total_score !== undefined ? s.total_score : (s.score || 0);
      if (score >= 700) platinumCount++;
      else if (score >= 500) goldCount++;
      else if (score >= 300) silverCount++;
      else if (score >= 100) bronzeCount++;
    });

    return {
      id: d.id,
      name: d.district_name,
      code: d.district_code,
      schools: districtSchools.length,
      platinum: platinumCount,
      gold: goldCount,
      silver: silverCount,
      bronze: bronzeCount,
      status: d.is_active ? "Active" : "Inactive",
      area: "N/A"
    };
  });

  const filteredDistricts = mappedDistricts.filter(
    (dist) =>
      dist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dist.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = mappedDistricts.filter((d) => d.status === "Active").length;
  const inactiveCount = mappedDistricts.filter((d) => d.status === "Inactive").length;
  
  const topDistrict = mappedDistricts.length > 0
    ? mappedDistricts.reduce((max, current) => current.schools > max.schools ? current : max, mappedDistricts[0])
    : null;

  const statsConfig = [
    {
      title: "Total Districts",
      value: mappedDistricts.length,
      color: "#3B82F6",
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Active Districts",
      value: activeCount,
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.1)",
    },
    {
      title: "Inactive Districts",
      value: inactiveCount,
      color: "#EF4444",
      bg: "rgba(239, 68, 68, 0.1)",
    },
    {
      title: "Top District",
      value: topDistrict?.name || "-",
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.1)",
    },
  ];

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading Districts Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 regional-admin-theme pb-8">
      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl p-4"
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
              <Map className="w-5 h-5" style={{ color: card.color }} />
            </div>
            <div
              className="text-xl mb-0.5"
              style={{ color: "var(--text-primary)", fontWeight: 700 }}
            >
              {card.value}
            </div>
            <div
              className="text-xs font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              {card.title}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Search Box */}
      <div 
        className="sticky top-[-24px] z-10 -mt-6 -mx-6 px-6 pt-6 pb-4 mb-3 border-b border-border"
        style={{ background: "var(--background)" }}
      >
        <div className="relative max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search districts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#6C63FF]/20"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {/* 3. Table list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--glass-card)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(20px)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[300px]">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                {["District", "Code", "Total Schools", "Platinum", "Gold", "Silver", "Bronze", "Status"].map(
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
              {filteredDistricts.map((dist) => (
                <tr
                  key={dist.id}
                  className="transition-colors hover:bg-[var(--glass-hover)]"
                  style={{ borderBottom: "1px solid var(--glass-border)" }}
                >
                  {/* District Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(59, 130, 246, 0.1)" }}
                      >
                        <Map className="w-4 h-4" style={{ color: "#3B82F6" }} />
                      </div>
                      <div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {dist.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* District Code */}
                  <td className="px-4 py-3 text-xs">
                    <span
                      className="px-2.5 py-0.5 rounded-lg font-mono font-semibold"
                      style={{
                        background: "var(--glass-hover)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {dist.code}
                    </span>
                  </td>

                  {/* Total Schools with progress bar */}
                  <td className="px-4 py-3">
                    <div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {dist.schools}
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden mt-1"
                        style={{
                          background: "var(--glass-hover)",
                          width: "70px",
                        }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${dist.schools > 0 ? Math.min(100, (dist.schools / 20) * 100) : 0}%`,
                            background: "linear-gradient(90deg, #3B82F6, #6366F1)",
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Rankings Breakdowns */}
                  <td className="px-4 py-3 text-xs">
                    <span
                      className="px-2 py-0.5 rounded-full font-bold"
                      style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8B5CF6" }}
                    >
                      {dist.platinum}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span
                      className="px-2 py-0.5 rounded-full font-bold"
                      style={{ background: "rgba(245, 158, 11, 0.1)", color: "#F59E0B" }}
                    >
                      {dist.gold}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span
                      className="px-2 py-0.5 rounded-full font-bold"
                      style={{ background: "rgba(148, 163, 184, 0.1)", color: "#94A3B8" }}
                    >
                      {dist.silver}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span
                      className="px-2 py-0.5 rounded-full font-bold"
                      style={{ background: "rgba(249, 115, 22, 0.1)", color: "#F97316" }}
                    >
                      {dist.bronze}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background:
                          dist.status === "Active" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: dist.status === "Active" ? "#10B981" : "#EF4444",
                      }}
                    >
                      {dist.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredDistricts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No districts match the search term.
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
