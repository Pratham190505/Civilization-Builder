import { useState } from "react";
import { HiOutlinePlus, HiOutlinePaperAirplane } from "react-icons/hi2";
import { Card } from "../../components/common/Page.jsx";
import { conversations, messageThread } from "../../data/adminData.js";

export default function Messages() {
  const [active, setActive] = useState(conversations[0]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
      <Card className="flex flex-col">
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">Messages</h3>
          <button className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-md shadow-blue-500/30">
            <HiOutlinePlus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1 p-3 pt-0">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                active.id === c.id ? "bg-primary/15" : "hover:bg-muted"
              }`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${c.color} text-xs font-semibold text-white`}>
                {c.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
              </div>
              {c.unread > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">{c.unread}</span>
              )}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <span className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${active.color} text-xs font-semibold text-white`}>
            {active.initials}
          </span>
          <div>
            <p className="font-semibold text-foreground">{active.name}</p>
            <p className="text-xs text-muted-foreground">{active.role}</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5 min-h-[400px]">
          {messageThread.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                m.from === "me" ? "bg-primary text-white" : "bg-muted text-foreground"
              }`}>
                <p>{m.text}</p>
                <p className={`mt-1 text-[10px] ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <input placeholder="Type your reply…" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
            <button className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white">
              <HiOutlinePaperAirplane className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
