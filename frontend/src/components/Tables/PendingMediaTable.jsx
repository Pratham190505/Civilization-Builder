import { useState, useEffect } from "react";
import { HiCheck, HiXMark, HiEye } from "react-icons/hi2";
import { getMediaList, approveMedia, rejectMedia } from "../../api/media";
import { toast } from "sonner";

export default function PendingMediaTable() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await getMediaList();
      if (res.success) {
        // Super Admin reviews submissions that are regional reviewed or submitted
        const pending = res.data.filter(
          (s) => s.status === "REGIONAL_REVIEWED" || s.status === "SUBMITTED"
        );
        setSubmissions(pending);
      }
    } catch (err) {
      console.error("Failed to load pending media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await approveMedia(id, "Approved from dashboard.");
      if (res.success) {
        toast.success("Media submission approved successfully!");
        fetchPending();
      }
    } catch (err) {
      toast.error(err.message || "Failed to approve media");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await rejectMedia(id, "Rejected from dashboard.");
      if (res.success) {
        toast.success("Media submission rejected successfully.");
        fetchPending();
      }
    } catch (err) {
      toast.error(err.message || "Failed to reject media");
    }
  };

  if (loading) {
    return (
      <div className="p-5 text-center text-xs text-muted-foreground">
        Loading pending media...
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        No pending media submissions to review.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <th className="px-4 py-3 text-left font-semibold">School</th>
            <th className="px-4 py-3 text-left font-semibold">District</th>
            <th className="px-4 py-3 text-left font-semibold">Submission Code</th>
            <th className="px-4 py-3 text-left font-semibold">Date</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((row) => (
            <tr key={row.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium text-foreground">
                {row.School?.school_name || "Unknown School"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.School?.District?.district_name || "N/A"}
              </td>
              <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                {row.submission_code}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.submitted_at
                  ? new Date(row.submitted_at).toLocaleDateString()
                  : "N/A"}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-md bg-amber-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleApprove(row.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400 cursor-pointer"
                  >
                    <HiCheck className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(row.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-500/25 dark:text-rose-400 cursor-pointer"
                  >
                    <HiXMark className="h-3.5 w-3.5" />
                    Reject
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
