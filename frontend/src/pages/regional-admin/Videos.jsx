import { useState, useEffect } from "react";
import { getMediaList, publishMedia } from "../../api/media";
import { toast } from "sonner";
import {
  Play,
  Upload,
  Trash2,
  Instagram,
  Facebook
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
            <div className="overflow-x-auto">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    {["Thumbnail", "Video", "School", "Platforms", "Published Date"].map(
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
