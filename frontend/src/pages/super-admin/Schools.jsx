import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineArrowRightOnRectangle, HiOutlineEye } from "react-icons/hi2";
import { Card, CardHeader, Tier, StatusPill } from "../../components/common/Page.jsx";
import { schoolsData } from "../../data/adminData.js";

export default function Schools() {
  return (
    <Card>
      <CardHeader
        title="School Management"
        subtitle={`${schoolsData.length} schools across India`}
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Search school…" className="w-48 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20">
              <HiOutlinePlus className="h-3.5 w-3.5" /> Add School
            </button>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 text-left">School Name</th>
              <th className="px-5 py-3 text-left">State</th>
              <th className="px-5 py-3 text-left">City</th>
              <th className="px-5 py-3 text-left">Regional Admin</th>
              <th className="px-5 py-3 text-left">School Admin</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Ranking</th>
              <th className="px-5 py-3 text-left">Social</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schoolsData.map((s) => (
              <tr key={s.name} className="border-t border-border">
                <td className="px-5 py-3 font-medium text-foreground">{s.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.state}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.city}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.regional}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.admin}</td>
                <td className="px-5 py-3"><StatusPill value={s.status} /></td>
                <td className="px-5 py-3"><Tier value={s.ranking} /></td>
                <td className="px-5 py-3"><StatusPill value={s.social} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <button className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-blue-300 hover:bg-primary/25">
                      <HiOutlineArrowRightOnRectangle className="h-3.5 w-3.5" /> Login
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
  );
}
