import { Card, CardHeader } from "../../components/common/Page.jsx";
import { useTheme } from "../../hooks/useTheme.jsx";

export default function Settings() {
  const { theme, toggle } = useTheme();
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="Account" subtitle="Your personal profile details" />
        <div className="space-y-4 p-5 pt-0">
          {[
            { label: "Full name", value: "Anurag Admin" },
            { label: "Email", value: "anurag@gds.in" },
            { label: "Role", value: "Super Admin" },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{f.label}</label>
              <input defaultValue={f.value} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none" />
            </div>
          ))}
          <button className="rounded-lg bg-linear-to-r from-blue-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20">Save changes</button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Preferences" subtitle="Customize how the hub looks and behaves" />
        <div className="space-y-4 p-5 pt-0">
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div>
              <p className="font-semibold text-foreground">Appearance</p>
              <p className="text-xs text-muted-foreground">Currently using {theme} theme</p>
            </div>
            <button onClick={toggle} className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
              Toggle
            </button>
          </div>
          {["Email notifications", "Push notifications", "Weekly digest"].map((p) => (
            <div key={p} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-sm">
              <p className="font-medium text-foreground">{p}</p>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border bg-background" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
