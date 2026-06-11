import { HiOutlineCheck, HiOutlineXMark, HiOutlineEye } from "react-icons/hi2";
import { pendingMedia } from "../../data/mockData.js";

export default function PendingMediaTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-4 py-3 text-left font-semibold">School</th>
            <th className="px-4 py-3 text-left font-semibold">State</th>
            <th className="px-4 py-3 text-left font-semibold">Uploaded By</th>
            <th className="px-4 py-3 text-left font-semibold">Date</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingMedia.map((row, idx) => (
            <tr key={idx} className="border-t border-border">
              <td className="px-4 py-3 font-medium text-foreground">{row.school}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.state}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.uploader}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.date}</td>
              <td className="px-4 py-3">
                <span className="rounded-md bg-amber-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Pending
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400">
                    <HiOutlineCheck className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-500/25 dark:text-rose-400">
                    <HiOutlineXMark className="h-3.5 w-3.5" />
                    Reject
                  </button>
                  <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                    <HiOutlineEye className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
