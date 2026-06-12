import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineFilm, HiOutlineCheck, HiOutlineXMark, HiOutlineEye } from "react-icons/hi2";
import { Card, CardHeader, StatusPill } from "../../components/common/Page.jsx";
import { mediaApprovals } from "../../data/adminData.js";

const stats = [
  { label: "Pending Media", value: "6", icon: HiOutlineClock, color: "text-amber-400 bg-amber-500/15" },
  { label: "Approved Media", value: "8,420", icon: HiOutlineCheckCircle, color: "text-emerald-400 bg-emerald-500/15" },
  { label: "Rejected Media", value: "326", icon: HiOutlineXCircle, color: "text-rose-400 bg-rose-500/15" },
];

export default function MediaApprovals() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="Media Approval Center" subtitle="Review uploaded school media — rejection requires a reason" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-5 py-3 text-left">Preview</th>
                <th className="px-5 py-3 text-left">School</th>
                <th className="px-5 py-3 text-left">State</th>
                <th className="px-5 py-3 text-left">Uploaded By</th>
                <th className="px-5 py-3 text-left">Caption</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {mediaApprovals.map((m, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-5 py-3">
                    <span className="grid h-9 w-12 place-items-center rounded-lg bg-primary/15 text-blue-300">
                      <HiOutlineFilm className="h-4 w-4" />
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">{m.school}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.state}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.uploader}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.caption}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{m.date}</td>
                  <td className="px-5 py-3"><StatusPill value={m.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <button className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25">
                        <HiOutlineCheck className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/25">
                        <HiOutlineXMark className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><HiOutlineEye className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
