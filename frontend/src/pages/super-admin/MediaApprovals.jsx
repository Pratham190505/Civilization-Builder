import { useState, useEffect } from "react";
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineFilm, HiOutlineCheck, HiOutlineXMark, HiOutlineEye } from "react-icons/hi2";
import { Card, CardHeader, StatusPill } from "../../components/common/Page.jsx";
import { getMediaList, approveMedia, rejectMedia, publishMedia } from "../../api/media";
import { toast } from "sonner";

export default function MediaApprovals() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  // Publish controls state
  const [publishingId, setPublishingId] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState({ facebook: true, instagram: true });

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
      const res = await approveMedia(id, "Final review approved by Super Admin.");
      if (res.success) {
        toast.success("Media submission approved successfully!");
        setSubmissions(prev =>
          prev.map(item =>
            item.id === id ? { ...item, status: "SUPER_APPROVED" } : item
          )
        );
      }
    } catch (err) {
      toast.error(err.message || "Approval failed");
    }
  };

  const handleReject = async (id) => {
    const comments = window.prompt("Enter rejection reason comments:");
    if (comments === null) return;
    try {
      const res = await rejectMedia(id, comments || "Rejection under quality guidelines.");
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

  const handlePublish = async (id) => {
    const platforms = [];
    if (selectedPlatforms.facebook) platforms.push("FACEBOOK");
    if (selectedPlatforms.instagram) platforms.push("INSTAGRAM");

    if (platforms.length === 0) {
      toast.error("Please select at least one social media platform");
      return;
    }

    try {
      toast.loading("Publishing to selected platforms...", { id: "pub" });
      const res = await publishMedia(id, platforms);
      if (res.success) {
        toast.success("Media published successfully!", { id: "pub" });
        setPublishingId(null);
        setSubmissions(prev =>
          prev.map(item =>
            item.id === id ? { ...item, status: "PUBLISHED" } : item
          )
        );
      }
    } catch (err) {
      toast.error(err.message || "Publishing failed", { id: "pub" });
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
      : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5003"}${asset.file_path}`;
  };

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading Media Approvals...</p>
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
        <div className="overflow-x-auto">
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
                        <span className="grid h-9 w-12 place-items-center rounded-lg bg-primary/15 text-blue-300">
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
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 cursor-pointer"
                            >
                              <HiOutlineCheck className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(m.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/25 cursor-pointer"
                            >
                              <HiOutlineXMark className="h-3.5 w-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {(m.status === "SUPER_APPROVED" || m.status === "APPROVED") && (
                          <button
                            onClick={() => setPublishingId(m.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-indigo-500/15 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25 cursor-pointer"
                          >
                            Publish
                          </button>
                        )}
                        {mediaUrl && (
                          <a
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                          >
                            <HiOutlineEye className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Publishing Modal */}
      {publishingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Select Social Platforms</h3>
            <p className="text-xs text-muted-foreground mt-1">Ready to publish the approved media post</p>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPlatforms.facebook}
                  onChange={(e) => setSelectedPlatforms({ ...selectedPlatforms, facebook: e.target.checked })}
                  className="h-4 w-4 rounded border-border bg-background text-primary"
                />
                Facebook Platform
              </label>
              <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPlatforms.instagram}
                  onChange={(e) => setSelectedPlatforms({ ...selectedPlatforms, instagram: e.target.checked })}
                  className="h-4 w-4 rounded border-border bg-background text-primary"
                />
                Instagram Reels
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setPublishingId(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePublish(publishingId)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer"
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
