import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getMediaList, publishMedia, deleteMedia, getMediaDetail } from "../../api/media";
import { toast } from "sonner";
import {
  Play,
  Upload,
  Trash2,
  Instagram,
  Facebook,
  X,
  Eye
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5003";

const platformConfig = {
  FACEBOOK: { icon: Facebook, color: "#1877F2", bg: "rgba(24, 119, 242, 0.1)" },
  INSTAGRAM: { icon: Instagram, color: "#E1306C", bg: "rgba(225, 48, 108, 0.1)" },
};

export default function Videos() {
  const [activeTab, setActiveTab] = useState("approved");
  const [loading, setLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState([]);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [mediaDetail, setMediaDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await getMediaList();
      if (res.success) {
        setMediaItems(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch media list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Approved pending upload/publish: SUPER_APPROVED or APPROVED
  const approvedList = mediaItems.filter(
    (item) => item.status === "SUPER_APPROVED" || item.status === "APPROVED"
  );

  // Uploaded/Published: PUBLISHED
  const uploadedList = mediaItems.filter(
    (item) => item.status === "PUBLISHED"
  );

  const handleUpload = async (id) => {
    try {
      // Prompt notes that only Facebook and Instagram are supported
      const res = await publishMedia(id, ["FACEBOOK", "INSTAGRAM"]);
      if (res.success) {
        toast.success("Media published to Facebook and Instagram successfully!");
        fetchMedia();
      } else {
        toast.error(res.message || "Failed to publish media");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred during publication");
    }
  };

  const confirmDelete = (item) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setDeleting(true);
      const res = await deleteMedia(deleteItem.id);
      if (res.success) {
        toast.success("Media deleted successfully!");
        setShowDeleteModal(false);
        setDeleteItem(null);
        fetchMedia();
      } else {
        toast.error(res.message || "Failed to delete media");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred during deletion");
    } finally {
      setDeleting(false);
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

  const getThumbnailUrl = (item) => {
    const asset = item.MediaSubmissionVersions?.[0]?.MediaAssets?.[0];
    if (asset && asset.file_path) {
      // If it starts with /uploads, prepend backend base URL
      return asset.file_path.startsWith("http")
        ? asset.file_path
        : `${API_BASE_URL}${asset.file_path}`;
    }
    return `https://picsum.photos/seed/${item.id}/120/68`;
  };

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading Media Items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 regional-admin-theme pb-8">
      {/* Sticky Header wrapper */}
      <div 
        className="sticky top-[-24px] z-10 -mt-6 -mx-6 px-6 pt-6 pb-4 mb-3 border-b border-border bg-[var(--background)] space-y-4"
        style={{ background: "var(--background)" }}
      >
        {/* 1. Header Summaries */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Videos & Media
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Manage approved and uploaded reels content
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                color: "#10B981",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              {approvedList.length} Approved
            </div>
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(139, 92, 246, 0.1)",
                color: "#8B5CF6",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              {uploadedList.length} Uploaded
            </div>
          </div>
        </div>

        {/* 2. Tabs Switcher */}
        <div
          className="flex rounded-xl p-1 w-fit"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
          }}
        >
          {["approved", "uploaded"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize cursor-pointer border-0"
              style={
                activeTab === tab
                  ? {
                      background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                      color: "#fff",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    }
                  : { color: "var(--text-secondary)" }
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Approved Videos Tab View */}
      {activeTab === "approved" && (
        <div
          className="rounded-2xl overflow-hidden animate-fade-in"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          {approvedList.length === 0 ? (
            <div className="py-16 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(59, 130, 246, 0.1)" }}
              >
                <Play className="w-8 h-8" style={{ color: "#3B82F6" }} />
              </div>
              <p style={{ color: "var(--text-muted)" }}>
                No approved videos pending upload
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[300px]">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    {["Thumbnail", "Video Name", "School", "Submission Code", "Approval Date", "Status", "Actions"].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left text-xs whitespace-nowrap"
                          style={{
                            color: "var(--text-muted)",
                            fontWeight: 600,
                          }}
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {approvedList.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-[var(--glass-hover)]"
                      style={{ borderBottom: "1px solid var(--glass-border)" }}
                    >
                      {/* Thumbnail with hover Play overlay */}
                      <td className="px-4 py-3">
                        <div
                          className="w-[80px] h-[46px] rounded-lg overflow-hidden relative group cursor-pointer"
                          style={{ background: "var(--heatmap-bg)" }}
                        >
                          <img
                            src={getThumbnailUrl(item)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            style={{ background: "rgba(0,0,0,0.4)" }}
                          >
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </td>

                      {/* Video name */}
                      <td className="px-4 py-3">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.title}
                        </div>
                      </td>

                      {/* School name */}
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                        {item.School?.school_name || "Unknown School"}
                      </td>

                      {/* Submission Code */}
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {item.submission_code}
                      </td>

                      {/* Approval Date */}
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(item.updatedAt || item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: "rgba(16, 185, 129, 0.1)",
                            color: "#10B981",
                          }}
                        >
                          ✓ Approved
                        </span>
                      </td>

                      {/* Upload action CTA */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpload(item.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-semibold transition-all hover:opacity-90 cursor-pointer border-0"
                            style={{
                              background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                            }}
                            title="Upload to social platforms"
                          >
                            <Upload className="w-3 h-3" />
                            Publish
                          </button>
                          <button
                            onClick={() => handleViewDetail(item.id)}
                            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all cursor-pointer border-0 bg-transparent"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Uploaded Videos Tab View */}
      {activeTab === "uploaded" && (
        <div
          className="rounded-2xl overflow-hidden animate-fade-in"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          {uploadedList.length === 0 ? (
            <div className="py-16 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(139, 92, 246, 0.1)" }}
              >
                <Upload className="w-8 h-8" style={{ color: "#8B5CF6" }} />
              </div>
              <p style={{ color: "var(--text-muted)" }}>No videos uploaded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[300px]">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    {["Thumbnail", "Video", "School", "Platforms", "Published Date", "Actions"].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left text-xs whitespace-nowrap"
                          style={{
                            color: "var(--text-muted)",
                            fontWeight: 600,
                          }}
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {uploadedList.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-[var(--glass-hover)]"
                      style={{ borderBottom: "1px solid var(--glass-border)" }}
                    >
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <div
                          className="w-[80px] h-[46px] rounded-lg overflow-hidden relative group cursor-pointer"
                          style={{ background: "var(--heatmap-bg)" }}
                        >
                          <img
                            src={getThumbnailUrl(item)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            style={{ background: "rgba(0,0,0,0.4)" }}
                          >
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </td>

                      {/* Title and duration info */}
                      <td className="px-4 py-3">
                        <div>
                          <div
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.title}
                          </div>
                          <div className="text-[10px] mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>
                            {item.submission_code}
                          </div>
                        </div>
                      </td>

                      {/* School name */}
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                        {item.School?.school_name || "Unknown School"}
                      </td>

                      {/* Platform indicators */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {Object.keys(platformConfig).map((pKey) => {
                            const platform = platformConfig[pKey];
                            const PlatformIcon = platform.icon;
                            return (
                              <span
                                key={pKey}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  background: platform.bg,
                                  color: platform.color,
                                }}
                              >
                                <PlatformIcon className="w-3 h-3" />
                                {pKey}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Upload Date */}
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        {new Date(item.updatedAt || item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(item.id)}
                            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all cursor-pointer border-0 bg-transparent"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(item)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer border-0 bg-transparent"
                            title="Delete submission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-hidden">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4 bg-surface">
              <h3 className="text-base font-bold text-foreground">
                Delete Media Submission
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItem(null);
                }}
                disabled={deleting}
                className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer border-0 bg-transparent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
              <p className="text-sm text-foreground">
                Are you sure you want to delete <span className="font-semibold">"{deleteItem?.title}"</span>? This action is permanent.
              </p>
              <p className="text-xs text-muted-foreground">
                This will purge the submission from the database, unlink the video/thumbnail files physically from storage, log the deletion event, and update school ranking statistics.
              </p>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 bg-surface flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItem(null);
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-muted cursor-pointer border-0 bg-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white cursor-pointer border-0 flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  "Delete Media"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

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
                              background: mediaDetail?.status === "PUBLISHED" ? "rgba(52,211,153,0.12)" : "rgba(245,158,11,0.12)",
                              color: mediaDetail?.status === "PUBLISHED" ? "#34d399" : "#f59e0b"
                            }}>
                            {mediaDetail?.status || "N/A"}
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
