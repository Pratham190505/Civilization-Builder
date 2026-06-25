import { useState, useEffect } from "react";
import { Card, CardHeader } from "../../components/common/Page.jsx";
import { getAuditLogs } from "../../api/security";
import { toast } from "sonner";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page to 1 when category or dates change
  useEffect(() => {
    setPage(1);
  }, [category, startDate, endDate]);

  const fetchLogs = async (currentPage) => {
    setLoading(true);
    try {
      const filters = {};
      if (category !== "All") filters.category = category;
      if (debouncedSearch.trim() !== "") filters.search = debouncedSearch;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const res = await getAuditLogs(currentPage, pagination.limit, filters);
      if (res.success && res.data) {
        setLogs(res.data.logs || []);
        setPagination(res.data.pagination || { page: currentPage, limit: 15, total: 0, pages: 1 });
      }
    } catch (err) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page, debouncedSearch, category, startDate, endDate]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.pages) {
      setPage(page + 1);
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
    <Card className="relative overflow-hidden">
      <CardHeader
        title="Audit Logs"
        subtitle="Track every administrative action across the platform"
        action={
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search actions, users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary placeholder-muted-foreground w-48 transition-colors"
            />
            {/* Date range pickers */}
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
            {/* Clear filters button */}
            {(search || startDate || endDate || category !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStartDate("");
                  setEndDate("");
                  setCategory("All");
                }}
                className="rounded-lg bg-white/5 border border-border hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-foreground cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        }
      />

      {/* Category Pills Row */}
      <div className="flex flex-wrap gap-2 px-5 pb-4 border-b border-border">
        {["All", "Schools", "Inspections", "Media", "Rankings", "Users", "System"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all cursor-pointer ${
              category === cat
                ? "bg-primary text-white border-primary"
                : "bg-surface text-muted-foreground border-border hover:text-foreground hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)] min-h-[300px]">
        <table className="w-full min-w-[1000px] text-sm relative border-collapse">
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border bg-surface">
              <th className="px-6 py-4 text-left sticky top-0 bg-surface z-10 border-b border-border">Log ID</th>
              <th className="px-6 py-4 text-left sticky top-0 bg-surface z-10 border-b border-border">Event</th>
              <th className="px-6 py-4 text-left sticky top-0 bg-surface z-10 border-b border-border">Category</th>
              <th className="px-6 py-4 text-left sticky top-0 bg-surface z-10 border-b border-border">User</th>
              <th className="px-6 py-4 text-left sticky top-0 bg-surface z-10 border-b border-border">School</th>
              <th className="px-6 py-4 text-left sticky top-0 bg-surface z-10 border-b border-border">Date & Time</th>
              <th className="px-6 py-4 text-left sticky top-0 bg-surface z-10 border-b border-border">IP Address</th>
              <th className="px-6 py-4 text-left sticky top-0 bg-surface z-10 border-b border-border">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((l, index) => {
              const isWarning = l.status === "WARNING";
              return (
                <tr 
                  key={l.id} 
                  className={`transition-colors hover:bg-muted/30 ${
                    index % 2 === 0 ? "bg-transparent" : "bg-muted/5"
                  }`}
                >
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    #LOG-{l.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground max-w-xs truncate" title={l.action}>
                    {l.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="rounded-md bg-muted px-2.5 py-1 text-[10px] uppercase font-bold tracking-wide text-foreground border border-border">
                      {l.entity_name || "SYSTEM"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                    {l.User ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs">{`${l.User.first_name || ""} ${l.User.last_name || ""}`}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{l.User.email}</span>
                      </div>
                    ) : (
                      <span className="italic text-muted-foreground text-xs">System / Guest</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium max-w-xs truncate" title={l.school_name || "System / Global"}>
                    {l.school_name || "System / Global"}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {l.created_at ? new Date(l.created_at).toLocaleString("en-IN") : "N/A"}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {l.ip_address || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isWarning
                          ? "bg-danger/10 text-danger border border-danger/20"
                          : "bg-success/10 text-success border border-success/20"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isWarning ? "bg-danger" : "bg-success"}`} />
                      {l.status || "SUCCESS"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-xs text-muted-foreground">
                  No audit logs found matching the selected filters.
                </td>
              </tr>
            )}
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
