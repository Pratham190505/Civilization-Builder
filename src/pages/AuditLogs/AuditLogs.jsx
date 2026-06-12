import { Card, CardHeader } from "../../components/common/Page.jsx";
import { auditLogs } from "../../data/adminData.js";

export default function AuditLogs() {
  return (
    <Card>
      <CardHeader title="Audit Logs" subtitle="Track every administrative action across the platform" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 text-left">Log ID</th>
              <th className="px-5 py-3 text-left">Action</th>
              <th className="px-5 py-3 text-left">Actor</th>
              <th className="px-5 py-3 text-left">Target</th>
              <th className="px-5 py-3 text-left">Time</th>
              <th className="px-5 py-3 text-left">IP</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.id}</td>
                <td className="px-5 py-3 font-medium text-foreground">{l.action}</td>
                <td className="px-5 py-3 text-muted-foreground">{l.actor}</td>
                <td className="px-5 py-3 text-muted-foreground">{l.target}</td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.time}</td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
