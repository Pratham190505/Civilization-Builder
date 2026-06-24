import { useState, useEffect } from "react";
import { Card, CardHeader } from "../../components/common/Page.jsx";
import { getAuditLogs } from "../../api/security";
import { toast } from "sonner";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAuditLogs(page, pagination.limit);
      if (res.success && res.data) {
        setLogs(res.data.logs || []);
        setPagination(res.data.pagination || { page, limit: 15, total: 0, pages: 1 });
      }
    } catch (err) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      fetchLogs(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.pages) {
      fetchLogs(pagination.page + 1);
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="grid h-48 place-items-center bg-background text-foreground rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading Audit Logs...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader title="Audit Logs" subtitle="Track every administrative action across the platform" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 text-left">Log ID</th>
              <th className="px-5 py-3 text-left">Action</th>
              <th className="px-5 py-3 text-left">Entity Category</th>
              <th className="px-5 py-3 text-left">Actor</th>
              <th className="px-5 py-3 text-left">Time</th>
              <th className="px-5 py-3 text-left">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-border hover:bg-white/5 transition">
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">#LOG-{l.id}</td>
                <td className="px-5 py-3 font-medium text-foreground">{l.action}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wide">
                    {l.entity_name || "SYSTEM"}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {l.User ? `${l.User.first_name || ""} ${l.User.last_name || ""} (${l.User.email})` : "System/Guest"}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                  {l.created_at ? new Date(l.created_at).toLocaleString() : "N/A"}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.ip_address || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <p className="text-xs text-muted-foreground">
            Showing Page <span className="font-semibold text-foreground">{pagination.page}</span> of{" "}
            <span className="font-semibold text-foreground">{pagination.pages}</span> ({pagination.total} logs total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={pagination.page === 1}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={pagination.page === pagination.pages}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
