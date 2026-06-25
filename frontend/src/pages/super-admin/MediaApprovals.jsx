import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineFilm, HiOutlineCheck, HiOutlineXMark, HiOutlineEye } from "react-icons/hi2";
import { Card, CardHeader, StatusPill } from "../../components/common/Page.jsx";
import { getMediaList, approveMedia, rejectMedia, getMediaDetail } from "../../api/media";
import { toast } from "sonner";
import { X, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

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

export default function MediaApprovals() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  // Modal details state
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [mediaDetail, setMediaDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadData = async () => {
    try {
      const res = await getMediaList();
      if (res.success && Array.isArray(res.data)) {
        setSubmissions(res.data);
      }
    } catch (err) {
      toast.error("Failed to load media submissions list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await approveMedia(id, "Final review approved by Super Admin.", false);
      if (res.success) {
        toast.success("Media submission approved successfully!");
        setSubmissions(prev =>
          prev.map(item =>
            item.id === id ? { ...item, status: "SUPER_APPROVED", is_featured: 0 } : item
          )
        );
      }
    } catch (err) {
      toast.error(err.message || "Approval failed");
    }
  };

  const handleReject = async (id) => {
    const comments = window.prompt("Enter rejection reason (mandatory):");
    if (comments === null) return;
    const trimmed = comments.trim();
    if (!trimmed) {
      toast.error("Rejection reason is mandatory.");
      return;
    }
    try {
      const res = await rejectMedia(id, trimmed);
      if (res.success) {
        toast.success("Media submission rejected successfully.");
        setSubmissions(prev =>
          prev.map(item =>
            item.id === id ? { ...item, status: "REJECTED" } : item
          )
        );
      }
    } catch (err) {
      toast.error(err.message || "Rejection failed");
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

  const stats = [
    {
      label: "Pending Media",
      value: submissions.filter((s) => s.status === "REGIONAL_REVIEWED" || s.status === "SUBMITTED").length.toString(),
      icon: HiOutlineClock,
      color: "text-amber-400 bg-amber-500/15",
    },
    {
      label: "Approved Media",
      value: submissions.filter((s) => s.status === "SUPER_APPROVED" || s.status === "APPROVED" || s.status === "PUBLISHED").length.toString(),
      icon: HiOutlineCheckCircle,
      color: "text-emerald-400 bg-emerald-500/15",
    },
    {
      label: "Rejected Media",
      value: submissions.filter((s) => s.status === "REJECTED").length.toString(),
      icon: HiOutlineXCircle,
      color: "text-rose-400 bg-rose-500/15",
    },
  ];

  const filteredSubmissions = submissions.filter((s) => {
    if (activeTab === "All") return true;
    if (activeTab === "Pending") return s.status === "REGIONAL_REVIEWED" || s.status === "SUBMITTED";
    if (activeTab === "Approved") return s.status === "SUPER_APPROVED" || s.status === "APPROVED" || s.status === "PUBLISHED";
    if (activeTab === "Rejected") return s.status === "REJECTED";
    return true;
  });

  const getMediaUrl = (s) => {
    const activeVersion = s.MediaSubmissionVersions?.[0];
    const asset = activeVersion?.MediaAssets?.[0];
    if (!asset || !asset.file_path) return null;
    return asset.file_path.startsWith("http")
      ? asset.file_path
      : `${API_BASE_URL}${asset.file_path}`;
  };

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-background text-foreground rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading Media Approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Media Approval Center"
          subtitle="Review uploaded school media — rejection requires a reason"
          className="sticky top-[64px] z-20 bg-surface border-b border-border pb-3"
          action={
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
              {["All", "Pending", "Approved", "Rejected"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    activeTab === tab ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          }
        />
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-350px)] min-h-[300px]">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-5 py-3 text-left">Preview</th>
                <th className="px-5 py-3 text-left">School</th>
                <th className="px-5 py-3 text-left">State</th>
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-left">Title / Caption</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((m) => {
                const mediaUrl = getMediaUrl(m);
                const isVideo = m.MediaSubmissionVersions?.[0]?.MediaAssets?.[0]?.file_type?.startsWith("video/");

                return (
                  <tr key={m.id} className="border-t border-border hover:bg-white/5 transition">
                    <td className="px-5 py-3">
                      {mediaUrl ? (
                        isVideo ? (
                          <video src={mediaUrl} className="h-10 w-16 object-cover rounded-lg border border-border bg-black" />
                        ) : (
                          <img src={mediaUrl} alt="" className="h-10 w-16 object-cover rounded-lg border border-border bg-black" />
                        )
                      ) : (
                        <span className="grid h-9 w-12 place-items-center rounded-lg bg-primary/15 text-primary">
                          <HiOutlineFilm className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">{m.School?.school_name || "Unknown School"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{m.School?.District?.State?.state_name || "N/A"}</td>
                    <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{m.submission_code}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <div className="max-w-[240px] truncate" title={m.description}>
                        <p className="font-semibold text-foreground truncate">{m.title}</p>
                        <p className="text-xs truncate">{m.description}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {m.submitted_at ? new Date(m.submitted_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill value={m.status} />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        {(m.status === "REGIONAL_REVIEWED" || m.status === "SUBMITTED") && (
                          <>
                            <button
                              onClick={() => handleApprove(m.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 cursor-pointer border-0"
                            >
                              <HiOutlineCheck className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(m.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/25 cursor-pointer border-0"
                            >
                              <HiOutlineXMark className="h-3.5 w-3.5" /> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleViewDetail(m.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-500/25 cursor-pointer border-0"
                        >
                          <HiOutlineEye className="h-3.5 w-3.5" /> View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No media approvals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
                        <span className="text-foreground font-medium">
                          {mediaDetail?.User
                            ? `${mediaDetail.User.first_name || ""} ${mediaDetail.User.last_name || ""} (${mediaDetail.User.email})`
                            : (mediaDetail?.submitted_by || "N/A")}
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
