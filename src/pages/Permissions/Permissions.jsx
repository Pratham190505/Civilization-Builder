import { useState } from "react";
import { HiOutlineLockClosed } from "react-icons/hi2";
import { Card, CardHeader } from "../../components/common/Page.jsx";
import { permissionMatrix } from "../../data/adminData.js";

function Toggle({ on, locked, onChange }) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => !locked && onChange(!on)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        on ? "bg-primary" : "bg-muted"
      } ${locked ? "opacity-90 cursor-not-allowed" : ""}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function Permissions() {
  const [rows, setRows] = useState(permissionMatrix);

  const toggle = (i, role) => {
    setRows((p) => p.map((r, idx) => idx === i ? { ...r, [role]: !r[role] } : r));
  };

  return (
    <Card>
      <CardHeader title="Role & Permission Control" subtitle="Manage access levels for each role. Super Admin permissions cannot be changed." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 text-left">Feature</th>
              <th className="px-5 py-3 text-center"><span className="rounded-full bg-blue-500/15 px-3 py-1 text-blue-300">Super Admin</span></th>
              <th className="px-5 py-3 text-center"><span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">Regional Admin</span></th>
              <th className="px-5 py-3 text-center"><span className="rounded-full bg-amber-500/15 px-3 py-1 text-amber-300">School Admin</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.feature} className="border-t border-border">
                <td className="px-5 py-3 font-medium text-foreground">{r.feature}</td>
                <td className="px-5 py-3 text-center"><div className="flex justify-center"><Toggle on={r.super} locked /></div></td>
                <td className="px-5 py-3 text-center"><div className="flex justify-center"><Toggle on={r.regional} onChange={() => toggle(i, "regional")} /></div></td>
                <td className="px-5 py-3 text-center"><div className="flex justify-center"><Toggle on={r.school} onChange={() => toggle(i, "school")} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pt-3">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <HiOutlineLockClosed className="h-3.5 w-3.5" /> Super Admin permissions are locked and cannot be changed
        </p>
        <button className="rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20">
          Save Permissions
        </button>
      </div>
    </Card>
  );
}
