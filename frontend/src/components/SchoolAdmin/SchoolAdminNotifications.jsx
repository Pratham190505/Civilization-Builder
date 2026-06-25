import { useState, useEffect } from "react";
import { getNotifications, markNotificationsAsRead } from "../../api/notifications";
import { toast } from "sonner";
import { Search, Bell, CheckCircle, AlertCircle, Info, XCircle, Check } from "lucide-react";

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

export default function SchoolAdminNotifications({ darkMode }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    try {
      const res = await markNotificationsAsRead(unreadIds);
      if (res.success) {
        toast.success("All notifications marked as read");
        fetchList();
        window.dispatchEvent(new CustomEvent("notification_read"));
      }
    } catch (err) {
      toast.error(err.message || "Failed to update notifications");
    }
  };

  const handleNotificationClick = async (n) => {
    if (n.is_read) return;
    try {
      const res = await markNotificationsAsRead([n.id]);
      if (res.success) {
        fetchList();
        window.dispatchEvent(new CustomEvent("notification_read"));
      }
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  };

  const getMappedType = (type) => {
    if (type?.includes("APPROVE")) return "success";
    if (type?.includes("REJECT") || type?.includes("ERROR")) return "error";
    if (type?.includes("WARN")) return "warning";
    return "info";
  };

  const mappedNotifications = notifications.map(n => ({
    id: n.id,
    title: n.Notification?.title || "System Alert",
    body: n.Notification?.message || "",
    time: formatTimeAgo(n.Notification?.created_at || n.Notification?.createdAt),
    type: getMappedType(n.Notification?.type),
    read: n.is_read,
    priority: n.Notification?.type?.includes("REJECT") ? "high" : "normal"
  }));

  const filtered = mappedNotifications.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    if (filter === "Action Required") return n.priority === "high";
    return true;
  });

  const unreadCount = mappedNotifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading Notifications Feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: mappedNotifications.length, color: "#4f7fff" },
          { label: "Unread", value: unreadCount, color: "#f59e0b" },
          { label: "Action Required", value: mappedNotifications.filter(n => n.priority === "high").length, color: "#ef4444" },
          { label: "Read", value: mappedNotifications.filter(n => n.read).length, color: "#34d399" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <div className="font-bold" style={{ color: s.color, fontSize: "1.5rem", lineHeight: 1 }}>{s.value}</div>
            <div className="text-sm mt-1" style={{ color: textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Notifications list */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        {/* Sticky Header and Filters Wrapper */}
        <div
          className="sticky top-[64px] z-20 -mt-5 -mx-5 px-5 pt-5 pb-1 mb-4 border-b border-border"
          style={{
            background: darkMode ? "rgba(17, 22, 36, 0.95)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: textPrimary }}>Notification Center</h3>
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 border-0 cursor-pointer"
              style={{ background: "rgba(79,127,255,0.12)", color: "#4f7fff" }}>
              <Check size={12} /> Mark All Read
            </button>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-2 mb-2">
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
                  className="px-3 py-2 rounded-xl text-xs transition-all font-semibold border-0 cursor-pointer"
                  style={{
                    background: filter === f ? "rgba(79,127,255,0.15)" : "transparent",
                    color: filter === f ? "#4f7fff" : textMuted,
                    border: filter === f ? "1px solid rgba(79,127,255,0.3)" : "1px solid transparent",
                  }}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Notification items */}
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[300px]">
          {filtered.map((n) => (
            <div key={n.id}
              className="flex items-start gap-3 p-4 rounded-xl transition-all hover:scale-[1.005] cursor-pointer"
              style={{
                background: !n.read ? (darkMode ? "rgba(79,127,255,0.06)" : "rgba(79,127,255,0.04)") : "transparent",
                border: !n.read ? "1px solid rgba(79,127,255,0.12)" : (darkMode ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.03)"),
              }}
              onClick={() => handleNotificationClick(n)}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: typeBg[n.type] }}>
                {typeIcon[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: textPrimary }}>{n.title}</span>
                  {n.priority === "high" && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>Action Required</span>
                  )}
                  {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 bg-blue-500 animate-pulse" />}
                </div>
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>{n.body}</p>
                <span className="text-[10px] mt-1 block" style={{ color: darkMode ? "#4a5568" : "#94a3b8" }}>{n.time}</span>
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
