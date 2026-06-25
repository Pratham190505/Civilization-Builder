import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../hooks/useAuth";
import { getMediaList, getMediaDetail } from "../../api/media";
import { Search, Filter, CheckCircle, Clock, XCircle, AlertCircle, Eye, X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5003";

const statusMeta = {
  PUBLISHED: { label: "Published", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: <CheckCircle size={12} /> },
  SUPER_APPROVED: { label: "Super Approved", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: <CheckCircle size={12} /> },
  APPROVED: { label: "Approved", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: <CheckCircle size={12} /> },
  SUBMITTED: { label: "Pending Regional Review", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: <Clock size={12} /> },
  REGIONAL_REVIEWED: { label: "Pending Super Review", color: "#4f7fff", bg: "rgba(79,127,255,0.12)", icon: <AlertCircle size={12} /> },
  REJECTED: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: <XCircle size={12} /> },
  DRAFT: { label: "Draft / Sent Back", color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: <AlertCircle size={12} /> },
};

export default function SchoolAdminMediaApproval({ darkMode }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [mediaDetail, setMediaDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await getMediaList();
      if (res.success) {
        setSubmissionsList(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load submissions list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    setSelectedMediaId(id);
    setShowDetailModal(true);
    setLoadingDetail(true);
    setMediaDetail(null);
    try {
      const res = await getMediaDetail(id);
      if (res.success) {
        setMediaDetail(res.data);
      } else {
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error("Error loading media detail:", err);
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getThumbnailUrl = (item) => {
    const asset = item.MediaSubmissionVersions?.[0]?.MediaAssets?.[0];
    if (asset && asset.file_path) {
      return asset.file_path.startsWith("http")
        ? asset.file_path
        : `${API_BASE_URL}${asset.file_path}`;
    }
    return `https://picsum.photos/seed/${item.id}/120/96`;
  };

  const filtered = submissionsList.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === "All") return true;
    if (activeFilter === "All Approved") return s.status === "APPROVED" || s.status === "SUPER_APPROVED" || s.status === "PUBLISHED";
    if (activeFilter === "Pending") return s.status === "SUBMITTED" || s.status === "REGIONAL_REVIEWED";
    if (activeFilter === "Sent Back") return s.status === "DRAFT";
    return true;
  });

  const counts = {
    total: submissionsList.length,
    pending: submissionsList.filter(s => s.status === "SUBMITTED" || s.status === "REGIONAL_REVIEWED").length,
    approved: submissionsList.filter(s => s.status === "APPROVED" || s.status === "SUPER_APPROVED" || s.status === "PUBLISHED").length,
    rejected: submissionsList.filter(s => s.status === "REJECTED").length,
  };

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading Media Statuses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Submissions", value: counts.total, color: "#4f7fff", sub: "All time uploads" },
          { label: "Pending Review", value: counts.pending, color: "#f59e0b", sub: "Awaiting approval" },
          { label: "Approved / Published", value: counts.approved, color: "#34d399", sub: "Live on social channels" },
          { label: "Rejected / Revisions", value: counts.rejected, color: "#ef4444", sub: "Needs revision" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <div className="font-bold" style={{ color: s.color, fontSize: "1.8rem", lineHeight: 1 }}>{s.value}</div>
            <div className="text-sm mt-1 font-medium" style={{ color: textPrimary }}>{s.label}</div>
            <div className="text-xs mt-1" style={{ color: textMuted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        {/* Sticky Filters Wrapper */}
        <div
          className="sticky top-[64px] z-20 -mt-5 -mx-5 px-5 pt-5 pb-1 mb-4 border-b border-border"
          style={{
            background: darkMode ? "rgba(17, 22, 36, 0.95)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[200px]"
              style={{ background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)" }}>
              <Search size={14} style={{ color: textMuted }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search submissions..."
                className="bg-transparent outline-none text-sm flex-1" style={{ color: textPrimary }} />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {["All", "All Approved", "Pending", "Sent Back"].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className="text-xs px-3 py-1.5 rounded-full transition-all font-semibold border-0 cursor-pointer"
                style={{
                  background: activeFilter === f ? "rgba(79,127,255,0.15)" : darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                  color: activeFilter === f ? "#4f7fff" : textMuted,
                  border: activeFilter === f ? "1px solid rgba(79,127,255,0.3)" : "1px solid transparent",
                }}>{f}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[300px]">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                {["Thumbnail", "Title & Code", "Submission Date", "Status", "Action"].map(h => (
                  <th key={h} className="text-left pb-3 pr-3 text-xs font-semibold" style={{ color: textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const meta = statusMeta[s.status] || statusMeta["DRAFT"];
                return (
                  <tr key={s.id} style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.03)" }}>
                    <td className="py-3 pr-3">
                      <div className="w-[80px] h-[46px] rounded-lg overflow-hidden relative">
                        <img
                          src={getThumbnailUrl(s)}
                          alt={s.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 pr-3 font-semibold text-[var(--text-primary)]" style={{ color: textPrimary, maxWidth: "260px" }}>
                      <div className="truncate text-sm">{s.title}</div>
                      <div className="text-[10px] font-mono mt-0.5" style={{ color: textMuted }}>{s.submission_code}</div>
                    </td>
                    <td className="py-3 pr-3 text-xs" style={{ color: textMuted }}>
                      {new Date(s.submitted_at || s.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit font-bold"
                        style={{ background: meta.bg, color: meta.color }}>
                        {meta.icon} {meta.label}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleViewDetail(s.id)}
                        className="text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-70 border-0 cursor-pointer text-blue-500 bg-blue-500/10 font-semibold"
                      >
                        View Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No media approvals list found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Media Detail Modal */}
      {showDetailModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-hidden">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4 bg-surface">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Media Submission Details
                </h3>
                <p className="text-xs text-muted-foreground">
                  Code: {loadingDetail ? "..." : mediaDetail?.submission_code || "N/A"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setMediaDetail(null);
                  setSelectedMediaId(null);
                }}
                className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer border-0 bg-transparent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <p className="text-xs text-muted-foreground">Loading details...</p>
              </div>
            ) : (
              <>
                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm text-foreground">
                  {/* Thumbnail / Media Preview */}
                  <div className="rounded-xl overflow-hidden border border-border bg-black/40 flex justify-center max-h-[240px]">
                    {(() => {
                      const activeVersion = mediaDetail?.MediaSubmissionVersions?.[0];
                      const asset = activeVersion?.MediaAssets?.[0];
                      if (!asset || !asset.file_path) return <p className="p-6 text-muted-foreground text-xs">No media preview available</p>;
                      const mediaUrl = asset.file_path.startsWith("http")
                        ? asset.file_path
                        : `${API_BASE_URL}${asset.file_path}`;
                      const isVideo = asset.file_type?.startsWith("video/");
                      return isVideo ? (
                        <video src={mediaUrl} controls className="max-w-full max-h-[240px] object-contain" />
                      ) : (
                        <img src={mediaUrl} alt="" className="max-w-full max-h-[240px] object-contain" />
                      );
                    })()}
                  </div>

                  {/* Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground font-medium block">Title</span>
                        <span className="font-semibold text-foreground">{mediaDetail?.title || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-medium block">Description</span>
                        <span className="text-foreground">{mediaDetail?.description || "No description provided"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-medium block">School Name</span>
                        <span className="text-foreground">{mediaDetail?.School?.school_name || "N/A"}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground font-medium block">Status</span>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-0.5"
                            style={{
                              background: statusMeta[mediaDetail?.status]?.bg || "rgba(255,255,255,0.05)",
                              color: statusMeta[mediaDetail?.status]?.color || "inherit"
                            }}>
                            {statusMeta[mediaDetail?.status]?.label || mediaDetail?.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground font-medium block">Media Type</span>
                          <span className="text-foreground font-medium">
                            {mediaDetail?.MediaSubmissionVersions?.[0]?.MediaAssets?.[0]?.file_type || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-medium block">Submission Date</span>
                        <span className="text-foreground">
                          {mediaDetail?.submitted_at ? new Date(mediaDetail.submitted_at).toLocaleString() : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-medium block">Uploaded By</span>
                        <span className="text-foreground">
                          {mediaDetail?.User
                            ? `${mediaDetail.User.first_name || ""} ${mediaDetail.User.last_name || ""} (${mediaDetail.User.email})`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Approval History */}
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Approval History</h4>
                    <div className="rounded-xl border border-border bg-muted/20 divide-y divide-border text-xs">
                      {mediaDetail?.SubmissionReviews?.length > 0 ? (
                        mediaDetail.SubmissionReviews.map((rev) => (
                          <div key={rev.id} className="p-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-foreground">{rev.reviewer_id === 1 ? "Super Admin" : "Regional Admin"} decision: <span className={rev.decision === "APPROVED" ? "text-emerald-400" : "text-rose-400"}>{rev.decision}</span></span>
                              <span className="text-muted-foreground">{new Date(rev.reviewed_at).toLocaleDateString()}</span>
                            </div>
                            {rev.comments && <p className="text-muted-foreground mt-1 italic">"{rev.comments}"</p>}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-muted-foreground italic">No review history available.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4 bg-surface flex justify-end">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setMediaDetail(null);
                      setSelectedMediaId(null);
                    }}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90 cursor-pointer border-0"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
