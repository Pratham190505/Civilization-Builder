import { useState } from "react";
import { Search, Filter, CheckCircle, Clock, XCircle, AlertCircle, Eye } from "lucide-react";

const submissions = [
  { title: "Annual Sports Day 2024", type: "Image", category: "Sports", date: "22 May 2024", time: "10:30 AM", district: "Central", superAdmin: "Not Reviewed", status: "Pending" },
  { title: "Science Fair Exhibition", type: "Image", category: "Academic", date: "22 May 2024", time: "02:15 PM", district: "Central", superAdmin: "Under Review", status: "Under Review" },
  { title: "Annual Sports Day Video", type: "Video", category: "Sports", date: "20 May 2024", time: "11:00 AM", district: "North", superAdmin: "Approved", status: "Approved" },
  { title: "International Yoga Day", type: "Image", category: "Health", date: "19 May 2024", time: "09:30 AM", district: "Central", superAdmin: "Not Reviewed", status: "Pending" },
  { title: "Tree Plantation Drive", type: "Image", category: "Environment", date: "19 May 2024", time: "03:45 PM", district: "South", superAdmin: "Sent Back", status: "Sent Back" },
  { title: "Cleanliness Drive", type: "Image", category: "Social Service", date: "18 May 2024", time: "01:00 PM", district: "East", superAdmin: "Rejected", status: "Rejected" },
  { title: "Art & Craft Competition", type: "Image", category: "Art", date: "16 May 2024", time: "10:00 AM", district: "West", superAdmin: "Approved", status: "Approved" },
  { title: "Monthly Report April 2024", type: "Image", category: "Academic", date: "01 May 2024", time: "09:00 AM", district: "Central", superAdmin: "Approved", status: "Approved" },
];

const statusMeta = {
  Approved: { color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: <CheckCircle size={12} /> },
  Pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: <Clock size={12} /> },
  "Under Review": { color: "#4f7fff", bg: "rgba(79,127,255,0.12)", icon: <AlertCircle size={12} /> },
  "Sent Back": { color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: <AlertCircle size={12} /> },
  Rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: <XCircle size={12} /> },
};

export default function SchoolAdminMediaApproval({ darkMode }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";

  const filtered = submissions.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === "All") return true;
    if (activeFilter === "All Approved") return s.status === "Approved";
    if (activeFilter === "Pending") return s.status === "Pending";
    if (activeFilter === "Sent Back") return s.status === "Sent Back";
    return true;
  });

  const counts = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "Pending").length,
    approved: submissions.filter(s => s.status === "Approved").length,
    rejected: submissions.filter(s => s.status === "Rejected").length,
    sentBack: submissions.filter(s => s.status === "Sent Back").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Submissions", value: counts.total, color: "#4f7fff", sub: "+10 this month" },
          { label: "Pending", value: counts.pending, color: "#f59e0b", sub: "20% of total" },
          { label: "Approved", value: counts.approved, color: "#34d399", sub: "59% of total" },
          { label: "Rejected", value: counts.rejected, color: "#ef4444", sub: "10% of total" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <div className="font-bold" style={{ color: s.color, fontSize: "1.8rem", lineHeight: 1 }}>{s.value}</div>
            <div className="text-sm mt-1 font-medium" style={{ color: textPrimary }}>{s.label}</div>
            <div className="text-xs mt-1" style={{ color: textMuted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[200px]"
            style={{ background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)" }}>
            <Search size={14} style={{ color: textMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search submissions..."
              className="bg-transparent outline-none text-sm flex-1" style={{ color: textPrimary }} />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{ background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)", color: textMuted }}>
            <Filter size={14} /> Filter
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {["All", "All Approved", "Pending", "Sent Back"].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className="text-xs px-3 py-1.5 rounded-full transition-all font-medium"
              style={{
                background: activeFilter === f ? "rgba(79,127,255,0.15)" : darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                color: activeFilter === f ? "#4f7fff" : textMuted,
                border: activeFilter === f ? "1px solid rgba(79,127,255,0.3)" : "1px solid transparent",
              }}>{f}</button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                {["Thumbnail", "Title", "Type", "Category", "Submitted Date", "District/School", "Super Admin Status", "Status", "Action"].map(h => (
                  <th key={h} className="text-left pb-3 pr-3 text-xs font-medium" style={{ color: textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const meta = statusMeta[s.status];
                const superMeta = statusMeta[s.superAdmin] || statusMeta["Pending"];
                return (
                  <tr key={i} style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.03)" }}>
                    <td className="py-3 pr-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, rgba(79,127,255,0.2), rgba(139,92,246,0.1))" }}>
                        <Eye size={14} style={{ color: "#4f7fff" }} />
                      </div>
                    </td>
                    <td className="py-3 pr-3 font-medium" style={{ color: textPrimary, maxWidth: "160px" }}>
                      <div className="truncate">{s.title}</div>
                      <div className="text-xs" style={{ color: textMuted }}>{s.time}</div>
                    </td>
                    <td className="py-3 pr-3 text-xs" style={{ color: textMuted }}>{s.type}</td>
                    <td className="py-3 pr-3 text-xs" style={{ color: textMuted }}>{s.category}</td>
                    <td className="py-3 pr-3 text-xs" style={{ color: textMuted }}>{s.date}</td>
                    <td className="py-3 pr-3 text-xs" style={{ color: textMuted }}>{s.district}</td>
                    <td className="py-3 pr-3">
                      <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"
                        style={{ background: superMeta.bg, color: superMeta.color }}>
                        {superMeta.icon} {s.superAdmin}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 w-fit font-medium"
                        style={{ background: meta.bg, color: meta.color }}>
                        {meta.icon} {s.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button className="text-xs px-2 py-1 rounded-lg transition-all hover:opacity-70" style={{ color: "#4f7fff" }}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-4 text-xs" style={{ color: textMuted }}>
            <span>Showing {filtered.length} of {submissions.length} entries</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(p => (
                <button key={p} className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: p === 1 ? "rgba(79,127,255,0.15)" : "transparent", color: p === 1 ? "#4f7fff" : textMuted }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
