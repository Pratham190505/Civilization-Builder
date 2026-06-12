import { useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import { Card, CardHeader, Tier } from "../../components/common/Page.jsx";
import { statesData } from "../../data/adminData.js";

const filters = ["All States", "Active", "Inactive", "Pending"];

export default function States() {
  const [active, setActive] = useState("All States");
  const [q, setQ] = useState("");
  const rows = statesData.filter((r) => r.state.toLowerCase().includes(q.toLowerCase()));

  return (
    <Card>
      <CardHeader
        title="State Management"
        subtitle={`${statesData.length} states registered across India`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActive(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    active === f ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search state…"
                className="w-44 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 text-left">State</th>
              <th className="px-5 py-3 text-left">Regional Admin</th>
              <th className="px-5 py-3 text-left">Total Schools</th>
              <th className="px-5 py-3 text-left">Active</th>
              <th className="px-5 py-3 text-left">Pending</th>
              <th className="px-5 py-3 text-left">Ranking Leader</th>
              <th className="px-5 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.state} className="border-t border-border">
                <td className="px-5 py-3 font-medium text-foreground">{r.state}</td>
                <td className="px-5 py-3 text-muted-foreground">{r.admin}</td>
                <td className="px-5 py-3 text-foreground">{r.total}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">{r.active}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">{r.pending}</span>
                </td>
                <td className="px-5 py-3"><Tier value={r.tier} /></td>
                <td className="px-5 py-3">
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-primary/20">
                    <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" /> View Region
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
