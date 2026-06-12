import { useState } from "react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader } from "../../components/common/Page.jsx";
import { analyticsTrend, activeTrend, stateActive, topPerformers, lowPerformers } from "../../data/adminData.js";

const ranges = ["Today", "Week", "Month", "Year"];

export default function Analytics() {
  const [range, setRange] = useState("Month");

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Media Upload & Approval Trends"
          subtitle="Monthly uploads, approvals, and rejections"
          action={
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    range === r ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          }
        />
        <div className="px-5 pb-2 text-xs">
          <div className="mb-2 flex flex-wrap gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Uploads</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Approvals</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Rejections</span>
          </div>
        </div>
        <div className="h-72 px-2 pb-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsTrend}>
              <defs>
                <linearGradient id="ua" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0f1424", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="uploads" stroke="#3b82f6" fill="url(#ua)" strokeWidth={2} />
              <Area type="monotone" dataKey="approvals" stroke="#10b981" fill="url(#ap)" strokeWidth={2} />
              <Area type="monotone" dataKey="rejections" stroke="#ef4444" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Active vs Inactive Schools" subtitle="Monthly trend of school activity" />
          <div className="h-64 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f1424", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="active" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="State-wise Performance" subtitle="Active schools per state" />
          <div className="h-64 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateActive}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="state" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f1424", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="active" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top Performing Schools" />
          <div className="space-y-3 p-5 pt-0">
            {topPerformers.map((p) => (
              <div key={p.rank}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">#{p.rank}</span>
                    <span className="font-medium text-foreground">{p.name}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-xs text-amber-400">{p.tier}</span>
                    <span className="text-xs font-semibold text-foreground">{p.score}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${p.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Low Performing Schools" />
          <div className="space-y-3 p-5 pt-0">
            {lowPerformers.map((p) => (
              <div key={p.name} className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                <div>
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-rose-400">{p.note}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-rose-400">{p.score}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">score</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
