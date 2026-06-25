import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { uploadMedia, submitMedia, getMediaList } from "../../api/media";
import { getSchoolById } from "../../api/schools";
import { toast } from "sonner";
import { Camera, Video, Activity, Award, Upload, CheckCircle, Clock, XCircle, AlertCircle, Info, X, Lock } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5003";

const tabs = [
  { id: "videos", label: "School Reels (Videos)", icon: Video, color: "#8b5cf6" },
  { id: "photos", label: "Activity Photos", icon: Camera, color: "#4f7fff" },
];

const statusColor = {
  PUBLISHED: "#34d399",
  SUPER_APPROVED: "#34d399",
  APPROVED: "#34d399",
  PENDING: "#f59e0b",
  REGIONAL_REVIEWED: "#4f7fff",
  SUBMITTED: "#4f7fff",
  REJECTED: "#ef4444",
  DRAFT: "#6b7280",
};

const statusIcon = {
  PUBLISHED: <CheckCircle size={12} />,
  SUPER_APPROVED: <CheckCircle size={12} />,
  APPROVED: <CheckCircle size={12} />,
  PENDING: <Clock size={12} />,
  REGIONAL_REVIEWED: <AlertCircle size={12} />,
  SUBMITTED: <AlertCircle size={12} />,
  REJECTED: <XCircle size={12} />,
  DRAFT: <Clock size={12} />,
};

const photoColors = ["#4f7fff", "#8b5cf6", "#22d3ee", "#f59e0b", "#34d399", "#ef4444"];

export default function SchoolAdminUploads({ darkMode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("videos");
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);

  const fileRef = useRef(null);
  const schoolId = user?.scope?.schoolId || 1;

  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";

  const activeTabInfo = tabs.find(t => t.id === activeTab);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const [mediaRes, schoolRes] = await Promise.all([
        getMediaList(),
        getSchoolById(schoolId)
      ]);
      if (mediaRes.success) {
        setSubmissions(mediaRes.data || []);
      }
      if (schoolRes.success && schoolRes.data) {
        setSchool(schoolRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch media center data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [schoolId]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setUploadedFiles([file.name]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadedFiles([file.name]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a media file to upload");
      return;
    }
    if (!title) {
      toast.error("Please provide a title");
      return;
    }

    try {
      setSubmitting(true);
      
      // Step 1: Upload raw file to Multer endpoint
      const uploadRes = await uploadMedia(schoolId, selectedFile);
      if (!uploadRes.success || !uploadRes.data?.id) {
        throw new Error(uploadRes.message || "Failed to upload raw file asset.");
      }

      const mediaAssetId = uploadRes.data.id;

      // Step 2: Submit final post details for approval review
      const submitRes = await submitMedia({
        media_asset_id: mediaAssetId,
        title,
        description,
        school_id: schoolId
      });

      if (submitRes.success) {
        toast.success("Reel uploaded and submitted for review!");
        setTitle("");
        setDescription("");
        setSelectedFile(null);
        setUploadedFiles([]);
        fetchSubmissions();
        window.dispatchEvent(new CustomEvent("media_updated"));
      } else {
        toast.error(submitRes.message || "Failed to submit post.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to complete upload workflow");
    } finally {
      setSubmitting(false);
    }
  };

  const getThumbnailUrl = (item) => {
    const asset = item.MediaSubmissionVersions?.[0]?.MediaAssets?.[0];
    if (asset && asset.file_path) {
      return asset.file_path.startsWith("http")
        ? asset.file_path
        : `${API_BASE_URL}${asset.file_path}`;
    }
    return `https://picsum.photos/seed/${item.id}/120/96`;
  };

  const maxSizeMB = activeTab === "videos" ? 500 : 10;

  // Calculate dynamic stats
  const totalCount = submissions.length;
  const approvedCount = submissions.filter(s => s.status === "PUBLISHED" || s.status === "APPROVED" || s.status === "SUPER_APPROVED").length;
  const pendingCount = submissions.filter(s => s.status === "SUBMITTED" || s.status === "REGIONAL_REVIEWED" || s.status === "PENDING").length;
  const rejectedCount = submissions.filter(s => s.status === "REJECTED").length;

  const isAwaitingInspection = school && (school.status === "AWAITING_INSPECTION" || school.score === null);
  const isSocialMissing = school && (!school.facebook_url || !school.instagram_url || !school.youtube_url);

  if (isAwaitingInspection) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px] rounded-3xl border border-dashed border-cyan-500/30 bg-cyan-500/5 backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-cyan-500/10 text-cyan-400">
          <Lock size={32} className="animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-slate-100 mb-2">Upload Features Locked</h3>
        <p className="text-sm text-slate-400 max-w-md leading-relaxed">
          Your school has not completed the physical inspection process yet. Media upload features will unlock after the Super Admin assigns a score and rank.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl" style={{ background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-1 justify-center transition-all border-0 cursor-pointer"
              style={{
                background: isActive ? (darkMode ? "#1a2035" : "#fff") : "transparent",
                color: isActive ? tab.color : textMuted,
                boxShadow: isActive ? (darkMode ? "none" : "0 2px 8px rgba(0,0,0,0.08)") : "none",
                border: isActive ? `1px solid ${tab.color}30` : "1px solid transparent",
              }}>
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Upload area + stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Drop zone */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: textPrimary }}>Upload {activeTabInfo?.label}</h3>
          </div>

          {isSocialMissing ? (
            <div className="flex flex-col items-center justify-center p-6 text-center border border-amber-500/20 bg-amber-500/5 rounded-2xl">
              <AlertCircle className="text-amber-500 h-10 w-10 mb-3 animate-bounce" />
              <h4 className="text-sm font-bold text-slate-200 mb-1">Social Media Links Required</h4>
              <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                Please complete your Facebook, Instagram, and YouTube details before uploading media content.
              </p>
              <button
                type="button"
                onClick={() => navigate("/school-admin/settings")}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer border-0 shadow-md"
              >
                Complete Social Media Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Submission Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Science Lab Experiment Reel"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-border"
                  style={{ background: "var(--glass-card)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Submission Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a catchy caption or description for social pages..."
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none border border-border"
                  style={{ background: "var(--glass-card)", color: "var(--text-primary)" }}
                />
              </div>

              {/* Dropzone */}
              <div
                className="rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${dragging ? activeTabInfo?.color : darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
                  background: dragging ? `${activeTabInfo?.color}08` : "transparent",
                  minHeight: "140px",
                  padding: "1.5rem",
                }}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange}
                  accept={activeTab === "photos" ? "image/*" : "video/*"} />
                
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2" style={{ background: `${activeTabInfo?.color}18` }}>
                  <Upload size={20} style={{ color: activeTabInfo?.color }} />
                </div>
                <p className="font-semibold text-xs mb-1" style={{ color: textPrimary }}>
                  Drag & drop file here, or <span style={{ color: activeTabInfo?.color }}>click to browse</span>
                </p>
                <p className="text-[10px]" style={{ color: textMuted }}>
                  {activeTab === "photos" ? "JPG, PNG, WebP" : "MP4, MOV"} · Max {maxSizeMB}MB
                </p>

                {uploadedFiles.length > 0 && (
                  <div className="mt-3 w-full space-y-1">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: `${activeTabInfo?.color}12`, color: textPrimary }}>
                        <CheckCircle size={11} style={{ color: "#34d399" }} />
                        <span className="flex-1 truncate">{f}</span>
                        <button type="button" onClick={e => { e.stopPropagation(); setUploadedFiles([]); setSelectedFile(null); }} className="border-0 bg-transparent cursor-pointer">
                          <X size={11} style={{ color: textMuted }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {uploadedFiles.length > 0 && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-3 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 text-white border-0 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
                >
                  {submitting ? "Uploading media..." : `Submit Post Review`}
                </button>
              )}
            </form>
          )}
        </div>

        {/* Stats + Guidelines */}
        <div className="flex flex-col gap-3">
          {/* Upload stats */}
          <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <h3 className="font-semibold mb-3" style={{ color: textPrimary }}>Upload Statistics</h3>
            {[
              { label: "Total Uploads", value: totalCount, color: textMuted },
              { label: "Approved / Published", value: approvedCount, color: "#34d399" },
              { label: "Pending Review", value: pendingCount, color: "#f59e0b" },
              { label: "Rejected", value: rejectedCount, color: "#ef4444" },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < 3 ? (darkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)") : "none" }}>
                <span className="text-sm" style={{ color: textMuted }}>{s.label}</span>
                <span className="font-semibold" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Guidelines */}
          <div className="rounded-2xl p-5 flex-1" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <div className="flex items-center gap-2 mb-3">
              <Info size={15} style={{ color: "#4f7fff" }} />
              <h3 className="font-semibold text-sm" style={{ color: textPrimary }}>Publishing Info</h3>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
              Your video uploads will be reviewed by the Regional Admin and approved by the Super Admin before automatically publishing to Facebook & Instagram pages.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: textPrimary }}>My Uploaded Posts</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {submissions.map((item, i) => (
            <div key={item.id} className="rounded-xl overflow-hidden cursor-pointer group transition-all hover:scale-[1.03]"
              style={{ border: cardBorder }}>
              <div className="h-24 flex items-center justify-center relative">
                <img
                  src={getThumbnailUrl(item)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                  <Video size={20} className="text-white" />
                </div>
              </div>
              <div className="p-2" style={{ background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
                <div className="text-xs font-semibold truncate" style={{ color: textPrimary }}>{item.title}</div>
                <div className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                  {new Date(item.submitted_at || item.createdAt).toLocaleDateString()}
                </div>
                <span className="text-[10px] flex items-center gap-1 mt-1 font-semibold" style={{ color: statusColor[item.status] || "#6b7280" }}>
                  {statusIcon[item.status] || <Clock size={12} />} {item.status}
                </span>
              </div>
            </div>
          ))}
          {submissions.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs" style={{ color: textMuted }}>
              No uploads found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
