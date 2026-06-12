import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { HiOutlineBookmark } from "react-icons/hi2";
import { Card, CardHeader, Tier } from "../../components/common/Page.jsx";
import { rankingsData } from "../../data/adminData.js";

const tiers = [
  { label: "Platinum", count: 82, color: "#cbd5e1" },
  { label: "Gold", count: 214, color: "#f59e0b" },
  { label: "Silver", count: 486, color: "#94a3b8" },
  { label: "Bronze", count: 302, color: "#f97316" },
  { label: "Not Ranked", count: 164, color: "#475569" },
];

const tierTone = {
  Platinum: "text-slate-200 border-slate-400",
  Gold: "text-amber-400 border-amber-500",
  Silver: "text-slate-300 border-slate-400",
  Bronze: "text-orange-400 border-orange-500",
  "Not Ranked": "text-muted-foreground border-border",
};

export default function Rankings() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {tiers.map((t) => (
          <div key={t.label} className="rounded-2xl border border-border bg-surface p-5 text-center">
            <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full border-2 text-sm font-bold ${tierTone[t.label]}`}>
              {t.count}
            </div>
            <p className="mt-3 font-semibold text-foreground">{t.label}</p>
            <p className="text-[11px] text-muted-foreground">schools</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader title="Ranking Distribution" />
          <div className="h-64 px-5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tiers} dataKey="count" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {tiers.map((t, i) => <Cell key={i} fill={t.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 p-5 pt-3 text-xs">
            {tiers.map((t) => (
              <div key={t.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                  {t.label}
                </span>
                <span className="font-semibold text-foreground">{t.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="School Ranking Table" subtitle="Manually assign or change school rankings" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">School Name</th>
                  <th className="px-5 py-3 text-left">State</th>
                  <th className="px-5 py-3 text-left">Score</th>
                  <th className="px-5 py-3 text-left">Current Rank</th>
                  <th className="px-5 py-3 text-left">Assign Rank</th>
                  <th className="px-5 py-3 text-left">Save</th>
                </tr>
              </thead>
              <tbody>
                {rankingsData.map((r) => (
                  <tr key={r.rank} className="border-t border-border">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">#{r.rank}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{r.school}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.state}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-amber-500" style={{ width: `${r.score}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-foreground">{r.score}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><Tier value={r.tier} /></td>
                    <td className="px-5 py-3">
                      <select className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none">
                        <option>Select…</option>
                        <option>Platinum</option>
                        <option>Gold</option>
                        <option>Silver</option>
                        <option>Bronze</option>
                        <option>Unranked</option>
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-primary/25">
                        <HiOutlineBookmark className="h-3.5 w-3.5" /> Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
