import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Map,
  Search,
  Eye,
  Pen
} from "lucide-react";
import { districts } from "../../data/regionalAdminMockData.js";

export default function Districts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter districts list
  const filteredDistricts = districts.filter(
    (dist) =>
      dist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dist.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = districts.filter((d) => d.status === "Active").length;
  const inactiveCount = districts.filter((d) => d.status === "Inactive").length;
  
  // Find top district based on school count
  const topDistrict = districts.reduce((max, current) =>
    current.schools > max.schools ? current : max
  , districts[0]);

  // Statistics counters cards
  const statsConfig = [
    {
      title: "Total Districts",
      value: districts.length,
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                {["District", "Code", "Total Schools", "Platinum", "Gold", "Silver", "Bronze", "Status", "Actions"].map(
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
                        <div
                          className="text-[11px] mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {dist.area}
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
                            width: `${(dist.schools / 312) * 100}%`,
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
                      style={{ background: "rgba(107, 114, 128, 0.1)", color: "#6B7280" }}
                    >
                      {dist.silver}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span
                      className="px-2 py-0.5 rounded-full font-bold"
                      style={{ background: "rgba(205, 127, 50, 0.1)", color: "#CD7F32" }}
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

                  {/* Actions buttons */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 rounded-lg transition-all cursor-pointer"
                        style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6" }}
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate("/regional-admin/add-district")}
                        className="p-1.5 rounded-lg transition-all cursor-pointer"
                        style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}
                        title="Edit"
                      >
                        <Pen className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDistricts.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
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
