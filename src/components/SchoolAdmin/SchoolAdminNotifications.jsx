import { useState } from "react";
import { Search, Bell, CheckCircle, AlertCircle, Info, XCircle, Check } from "lucide-react";

const allNotifications = [
  { id: 1, title: "New school added by Gujarat Regional Admin", body: "GDS Surat has been added and is awaiting approval.", time: "2h ago", type: "info", read: false, priority: "normal" },
  { id: 2, title: "GDS Vadodara uploaded new reel", body: "New media is available in the Media Center.", time: "3h ago", type: "success", read: false, priority: "normal" },
  { id: 3, title: "GDS Pune upgraded to Platinum", body: "Ranking system updated their performance score.", time: "1h ago", type: "success", read: false, priority: "high" },
  { id: 4, title: "Media rejected — log quality issue", body: "Log from 290.180.93.112 — India, flag this upload.", time: "2h ago", type: "error", read: true, priority: "high" },
  { id: 5, title: "Maharashtra region added 4 new schools", body: "GDS Region: 500 Total, 600 Accomplished, GDS School added.", time: "3h ago", type: "info", read: true, priority: "normal" },
  { id: 6, title: "GDS Indore approval pending", body: "Upload approval is pending for Punjab Regional Admin.", time: "4h ago", type: "warning", read: true, priority: "normal" },
  { id: 7, title: "Monthly report for April 2024 is ready", body: "Your school performance report is generated successfully.", time: "5h ago", type: "success", read: true, priority: "normal" },
  { id: 8, title: "Action Required: Complete school profile", body: "Please update your school's contact and achievement info.", time: "1d ago", type: "warning", read: true, priority: "high" },
  { id: 9, title: "System maintenance scheduled", body: "Downtime planned from 2:00 AM – 4:00 AM IST on Sunday.", time: "2d ago", type: "info", read: true, priority: "normal" },
];

const typeIcon = {
  success: <CheckCircle size={16} style={{ color: "#34d399" }} />,
  error: <XCircle size={16} style={{ color: "#ef4444" }} />,
  warning: <AlertCircle size={16} style={{ color: "#f59e0b" }} />,
  info: <Info size={16} style={{ color: "#4f7fff" }} />,
};

const typeBg = {
  success: "rgba(52,211,153,0.12)",
  error: "rgba(239,68,68,0.12)",
  warning: "rgba(245,158,11,0.12)",
  info: "rgba(79,127,255,0.12)",
};

export default function SchoolAdminNotifications({ darkMode }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState(allNotifications);

  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const filtered = notifications.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    if (filter === "Action Required") return n.priority === "high";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: notifications.length, color: "#4f7fff" },
          { label: "Unread", value: unreadCount, color: "#f59e0b" },
          { label: "Action Required", value: notifications.filter(n => n.priority === "high").length, color: "#ef4444" },
          { label: "Read", value: notifications.filter(n => n.read).length, color: "#34d399" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <div className="font-bold" style={{ color: s.color, fontSize: "1.5rem", lineHeight: 1 }}>{s.value}</div>
            <div className="text-sm mt-1" style={{ color: textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Notifications list */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: textPrimary }}>Notification Center</h3>
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
            style={{ background: "rgba(79,127,255,0.12)", color: "#4f7fff" }}>
            <Check size={12} /> Mark All Read
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
            style={{ background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)" }}>
            <Search size={14} style={{ color: textMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="bg-transparent outline-none text-sm flex-1" style={{ color: textPrimary }} />
          </div>
          <div className="flex gap-1">
            {["All", "Unread", "Action Required"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-2 rounded-xl text-xs transition-all font-medium"
                style={{
                  background: filter === f ? "rgba(79,127,255,0.15)" : "transparent",
                  color: filter === f ? "#4f7fff" : textMuted,
                  border: filter === f ? "1px solid rgba(79,127,255,0.3)" : "1px solid transparent",
                }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Notification items */}
        <div className="space-y-2">
          {filtered.map((n) => (
            <div key={n.id}
              className="flex items-start gap-3 p-4 rounded-xl transition-all hover:scale-[1.005] cursor-pointer"
              style={{
                background: !n.read ? (darkMode ? "rgba(79,127,255,0.06)" : "rgba(79,127,255,0.04)") : "transparent",
                border: !n.read ? "1px solid rgba(79,127,255,0.12)" : (darkMode ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.03)"),
              }}
              onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: typeBg[n.type] }}>
                {typeIcon[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: textPrimary }}>{n.title}</span>
                  {n.priority === "high" && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>Action Required</span>
                  )}
                  {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#4f7fff" }} />}
                </div>
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>{n.body}</p>
                <span className="text-xs mt-1 block" style={{ color: darkMode ? "#4a5568" : "#94a3b8" }}>{n.time}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10" style={{ color: textMuted }}>
              <Bell size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notifications found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
