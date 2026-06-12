import { useState } from "react";
import {
  Play,
  Upload,
  Trash2,
  Youtube,
  Instagram,
  Facebook
} from "lucide-react";
import { videosApproved, videosUploaded } from "../../data/regionalAdminMockData.js";

const platformConfig = {
  YouTube: { icon: Youtube, color: "#FF0000", bg: "rgba(255, 0, 0, 0.1)" },
  Instagram: { icon: Instagram, color: "#E1306C", bg: "rgba(225, 48, 108, 0.1)" },
  Facebook: { icon: Facebook, color: "#1877F2", bg: "rgba(24, 119, 242, 0.1)" },
};

export default function Videos() {
  const [activeTab, setActiveTab] = useState("approved");
  const [approvedList, setApprovedList] = useState(videosApproved);
  const [uploadedList, setUploadedList] = useState(videosUploaded);

  const handleUpload = (id) => {
    const video = approvedList.find((v) => v.id === id);
    if (video) {
      // Remove from approved list
      setApprovedList((prev) => prev.filter((v) => v.id !== id));
      // Add to uploaded list
      setUploadedList((prev) => [
        {
          ...video,
          status: "Uploaded",
          platform: "YouTube",
          uploadedDate: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
    }
  };

  const handleDelete = (id) => {
    setUploadedList((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-5 regional-admin-theme pb-8">
      {/* 1. Header Summaries */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Videos & Media
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Manage approved and uploaded content
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
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize cursor-pointer"
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
                    {["Thumbnail", "Video Name", "School", "Duration", "Approved By", "Approval Date", "Status", "Actions"].map(
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
                            src={item.thumbnail}
                            alt={item.name}
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
                          {item.name}
                        </div>
                      </td>

                      {/* School name */}
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                        {item.school}
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {item.duration}
                      </td>

                      {/* Approved By */}
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                        {item.approvedBy}
                      </td>

                      {/* Approval Date */}
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(item.approvalDate).toLocaleDateString("en-IN", {
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
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-semibold transition-all hover:opacity-90 cursor-pointer"
                            style={{
                              background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                            }}
                            title="Upload to platform"
                          >
                            <Upload className="w-3 h-3" />
                            Upload
                          </button>
                          <button
                            disabled
                            className="p-1.5 rounded-lg opacity-30 cursor-not-allowed"
                            style={{
                              background: "rgba(239,68,68,0.1)",
                              color: "#EF4444",
                            }}
                            title="Cannot delete approved videos"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                    {["Thumbnail", "Video", "School", "Platform", "Uploaded Date", "Actions"].map(
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
                  {uploadedList.map((item) => {
                    const platform = platformConfig[item.platform];
                    const PlatformIcon = platform ? platform.icon : Youtube;

                    return (
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
                              src={item.thumbnail}
                              alt={item.name}
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
                              {item.name}
                            </div>
                            <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                              {item.duration}
                            </div>
                          </div>
                        </td>

                        {/* School name */}
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                          {item.school}
                        </td>

                        {/* Platform indicator badge */}
                        <td className="px-4 py-3">
                          {platform && (
                            <span
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-xs font-semibold"
                              style={{
                                background: platform.bg,
                                color: platform.color,
                              }}
                            >
                              <PlatformIcon className="w-3.5 h-3.5" />
                              {item.platform}
                            </span>
                          )}
                        </td>

                        {/* Upload Date */}
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                          {item.uploadedDate
                            ? new Date(item.uploadedDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>

                        {/* Delete uploaded action */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg transition-all hover:bg-[var(--glass-hover)] text-red-500 hover:text-red-400 cursor-pointer"
                            style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.15)",
                            }}
                            title="Delete uploaded video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
