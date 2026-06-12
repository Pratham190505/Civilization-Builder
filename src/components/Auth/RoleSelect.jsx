import { HiOutlineShieldCheck, HiOutlineUserGroup, HiOutlineAcademicCap } from "react-icons/hi2";

const roles = [
  { id: "super", label: "Super Admin", desc: "Full platform access", icon: HiOutlineShieldCheck, tone: "from-blue-500 to-violet-500" },
  { id: "regional", label: "Regional Admin", desc: "State-level controls", icon: HiOutlineUserGroup, tone: "from-emerald-500 to-teal-500" },
  { id: "school", label: "School Admin", desc: "Single school access", icon: HiOutlineAcademicCap, tone: "from-amber-500 to-orange-500" },
];

export default function RoleSelect({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Login as
      </label>
      <div className="grid grid-cols-1 gap-2">
        {roles.map((r) => {
          const active = value === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange(r.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                active
                  ? "border-primary/60 bg-primary/10"
                  : "border-border bg-surface hover:bg-muted"
              }`}
            >
              <span className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${r.tone} text-white`}>
                <r.icon className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{r.label}</p>
                <p className="text-[11px] text-muted-foreground">{r.desc}</p>
              </div>
              <span className={`h-4 w-4 rounded-full border-2 ${active ? "border-primary bg-primary" : "border-border"}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
