import { useState, useEffect } from "react";
import { HiOutlinePlus, HiOutlineCheckCircle, HiOutlineTrophy, HiOutlineXCircle, HiOutlineBuildingOffice2, HiOutlineBell, HiOutlineCheck } from "react-icons/hi2";
import { Card, CardHeader } from "../../components/common/Page.jsx";
import { getNotifications, markNotificationsAsRead } from "../../api/notifications";
import { toast } from "sonner";

const iconMap = {
  plus: HiOutlinePlus,
  media: HiOutlineCheckCircle,
  trophy: HiOutlineTrophy,
  x: HiOutlineXCircle,
  building: HiOutlineBuildingOffice2,
  bell: HiOutlineBell,
};

const toneMap = {
  green: "bg-emerald-500/15 text-emerald-400",
  amber: "bg-amber-500/15 text-amber-400",
  violet: "bg-violet-500/15 text-violet-400",
  red: "bg-rose-500/15 text-rose-400",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  muted: "bg-muted text-muted-foreground",
};

export default function Notifications() {
  const [notificationsList, setNotificationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");

  const fetchNotificationsData = async () => {
    try {
      const res = await getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotificationsList(res.data);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationsData();

    // Listen to real-time socket notifications dispatched by useAuth
    const handleNewNotification = () => {
      fetchNotificationsData();
    };
    window.addEventListener("new_notification", handleNewNotification);
    return () => {
      window.removeEventListener("new_notification", handleNewNotification);
    };
  }, []);

  const handleMarkAllRead = async () => {
    const unreadIds = notificationsList.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) {
      toast.info("No unread notifications");
      return;
    }
    try {
      const res = await markNotificationsAsRead(unreadIds);
      if (res.success) {
        toast.success("All notifications marked as read");
        fetchNotificationsData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update notifications");
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      const res = await markNotificationsAsRead([id]);
      if (res.success) {
        fetchNotificationsData();
      }
    } catch (err) {
      console.error("Failed to mark single notification as read:", err);
    }
  };

  const unreadCount = notificationsList.filter((n) => !n.is_read).length;

  const getVisualConfig = (type) => {
    const t = (type || "").toUpperCase();
    if (t.includes("SCHOOL_APPROVED")) return { icon: "building", tone: "green", badge: "School Onboarding" };
    if (t.includes("SCHOOL_REJECTED")) return { icon: "building", tone: "red", badge: "School Onboarding" };
    if (t.includes("MEDIA_APPROVED")) return { icon: "media", tone: "green", badge: "Media Approved" };
    if (t.includes("MEDIA_REJECTED")) return { icon: "media", tone: "red", badge: "Media Rejected" };
    if (t.includes("RANK")) return { icon: "trophy", tone: "violet", badge: "Ranking Update" };
    return { icon: "bell", tone: "blue", badge: "Alert" };
  };

  const filteredList = notificationsList.filter((n) => {
    if (tab === "Unread") return !n.is_read;
    if (tab === "Action Required") {
      const config = getVisualConfig(n.Notification?.type);
      return config.badge === "School Onboarding" || config.badge === "Media Approved";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-background text-foreground rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading Notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Notification Center"
        subtitle={`${unreadCount} unread notifications`}
        action={
          <button
            onClick={handleMarkAllRead}
            className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25 cursor-pointer"
          >
            Mark all read
          </button>
        }
      />
      <div className="px-5">
        <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-background p-1">
          {[
            { l: "All" },
            { l: "Unread", c: unreadCount, tone: "bg-rose-500" },
            { l: "Action Required" },
          ].map((t) => (
            <button
              key={t.l}
              onClick={() => setTab(t.l)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition ${
                tab === t.l ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.l}
              {t.c != null && t.c > 0 && (
                <span className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white ${t.tone}`}>
                  {t.c}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3 p-5">
        {filteredList.map((recipientRecord) => {
          const n = recipientRecord.Notification || {};
          const config = getVisualConfig(n.type);
          const Icon = iconMap[config.icon] || HiOutlineBell;

          return (
            <div
              key={recipientRecord.id}
              onClick={() => !recipientRecord.is_read && handleMarkSingleRead(recipientRecord.id)}
              className={`relative flex items-start gap-3 rounded-xl border border-border p-4 shadow-sm transition ${
                recipientRecord.is_read ? "bg-surface/50 opacity-70" : "bg-surface border-blue-500/20 hover:border-blue-500/40 cursor-pointer"
              }`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${toneMap[config.tone]}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{n.title || "Alert"}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {n.created_at ? new Date(n.created_at).toLocaleString() : "Just now"}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                      !recipientRecord.is_read ? "bg-rose-500/15 text-rose-400" : "bg-white/5 text-muted-foreground"
                    }`}
                  >
                    {config.badge}
                  </span>
                </div>
              </div>
              {!recipientRecord.is_read && (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                    <HiOutlineCheck className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
