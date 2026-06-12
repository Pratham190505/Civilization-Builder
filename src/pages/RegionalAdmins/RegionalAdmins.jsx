import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlinePencilSquare, HiOutlineUserPlus, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { Card, CardHeader, StatusPill } from "../../components/common/Page.jsx";
import { regionalAdmins } from "../../data/adminData.js";

export default function RegionalAdmins() {
  return (
    <Card>
      <CardHeader
        title="Regional Admin Management"
        subtitle={`${regionalAdmins.length} regional admins across India`}
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Search admin…" className="w-48 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20">
              <HiOutlinePlus className="h-3.5 w-3.5" /> Add Regional Admin
            </button>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 text-left">Admin</th>
              <th className="px-5 py-3 text-left">Assigned State</th>
              <th className="px-5 py-3 text-left">Schools Managed</th>
              <th className="px-5 py-3 text-left">Contact</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {regionalAdmins.map((a) => (
              <tr key={a.email} className="border-t border-border">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${a.color} text-xs font-semibold text-white`}>
                      {a.initials}
                    </span>
                    <span className="font-medium text-foreground">{a.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{a.state}</td>
                <td className="px-5 py-3 text-foreground">{a.schools}</td>
                <td className="px-5 py-3 text-muted-foreground">{a.email}</td>
                <td className="px-5 py-3"><StatusPill value={a.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <button className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-blue-300 hover:bg-primary/25">
                      <HiOutlineArrowRightOnRectangle className="h-3.5 w-3.5" /> Login As
                    </button>
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><HiOutlinePencilSquare className="h-4 w-4" /></button>
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><HiOutlineUserPlus className="h-4 w-4" /></button>
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
