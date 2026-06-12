import { useState } from "react";
import { HiOutlinePlus, HiOutlineCheckCircle, HiOutlineTrophy, HiOutlineXCircle, HiOutlineBuildingOffice2, HiOutlineBell } from "react-icons/hi2";
import { Card, CardHeader } from "../../components/common/Page.jsx";
import { notifications } from "../../data/adminData.js";

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
  blue: "bg-blue-500/15 text-blue-400",
  muted: "bg-muted text-muted-foreground",
};

export default function Notifications() {
  const [tab, setTab] = useState("All");
  const unreadCount = notifications.filter((n) => n.unread).length;
  const list = tab === "Unread" ? notifications.filter((n) => n.unread)
              : tab === "Action Required" ? notifications.filter((n) => n.badge === "Action Required")
              : notifications;

  return (
    <Card>
      <CardHeader
        title="Notification Center"
        subtitle={`${unreadCount} unread notifications`}
        action={
          <button className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-primary/25">
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
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                tab === t.l ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.l}
              {t.c != null && <span className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white ${t.tone}`}>{t.c}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3 p-5">
        {list.map((n) => {
          const Icon = iconMap[n.icon] || HiOutlineBell;
          return (
            <div key={n.id} className="relative flex items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${toneMap[n.tone]}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">{n.time}</span>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                    n.badge === "Action Required" ? "bg-rose-500/15 text-rose-400" : "bg-white/5 text-muted-foreground"
                  }`}>{n.badge}</span>
                </div>
              </div>
              {n.unread && <span className="h-2 w-2 rounded-full bg-blue-500" />}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
