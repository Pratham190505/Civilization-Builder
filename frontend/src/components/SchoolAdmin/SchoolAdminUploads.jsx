import { useState, useRef } from "react";
import { Camera, Video, Activity, Award, Upload, CheckCircle, Clock, XCircle, AlertCircle, Info, X } from "lucide-react";

const tabs = [
  { id: "photos", label: "Photos", icon: Camera, color: "#4f7fff" },
  { id: "videos", label: "Videos", icon: Video, color: "#8b5cf6" },
  { id: "activities", label: "Activities", icon: Activity, color: "#22d3ee" },
  { id: "achievements", label: "Achievements", icon: Award, color: "#f59e0b" },
];

const gallery = [
  { title: "Annual Sports Day", date: "10 May 2024", status: "Approved", tag: "Sports" },
  { title: "Science Exhibition", date: "22 May 2024", status: "Pending", tag: "Academic" },
  { title: "Cultural Program", date: "15 May 2024", status: "Approved", tag: "Cultural" },
  { title: "Tree Plantation", date: "05 Jun 2024", status: "Under Review", tag: "Environment" },
  { title: "Art Competition", date: "18 May 2024", status: "Approved", tag: "Art" },
  { title: "Yoga Day Event", date: "21 Jun 2024", status: "Sent Back", tag: "Health" },
];

const statusColor = { Approved: "#34d399", Pending: "#f59e0b", "Under Review": "#4f7fff", "Sent Back": "#ef4444" };
const statusIcon = {
  Approved: <CheckCircle size={12} />,
  Pending: <Clock size={12} />,
  "Under Review": <AlertCircle size={12} />,
  "Sent Back": <XCircle size={12} />,
};

const photoColors = ["#4f7fff", "#8b5cf6", "#22d3ee", "#f59e0b", "#34d399", "#ef4444"];

export default function SchoolAdminUploads({ darkMode }) {
  const [activeTab, setActiveTab] = useState("photos");
  const [dragging, setDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileRef = useRef(null);

  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";

  const activeTabInfo = tabs.find(t => t.id === activeTab);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).map(f => f.name);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(f => f.name);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const maxSizeMB = activeTab === "videos" ? 500 : activeTab === "photos" ? 10 : 50;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl" style={{ background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-1 justify-center transition-all"
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
            <h3 className="font-semibold" style={{ color: textPrimary }}>Upload {tabs.find(t => t.id === activeTab)?.label}</h3>
            <button className="text-xs px-3 py-1.5 rounded-xl font-medium" style={{ background: "rgba(79,127,255,0.12)", color: "#4f7fff" }}>
              Upload Guidelines
            </button>
          </div>

          {/* Dropzone */}
          <div
            className="rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
            style={{
              border: `2px dashed ${dragging ? activeTabInfo.color : darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
              background: dragging ? `${activeTabInfo.color}08` : "transparent",
              minHeight: "160px",
              padding: "2rem",
            }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange}
              accept={activeTab === "photos" ? "image/*" : activeTab === "videos" ? "video/*" : "*"} />
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: `${activeTabInfo.color}18` }}>
              <Upload size={24} style={{ color: activeTabInfo.color }} />
            </div>
            <p className="font-medium mb-1" style={{ color: textPrimary }}>
              Drag & drop {activeTab} here, or <span style={{ color: activeTabInfo.color }}>click to browse</span>
            </p>
            <p className="text-xs" style={{ color: textMuted }}>
              {activeTab === "photos" ? "JPG, PNG, WebP" : activeTab === "videos" ? "MP4, MOV, AVI" : "PDF, DOC, JPG"} · Max {maxSizeMB}MB per file
            </p>

            {uploadedFiles.length > 0 && (
              <div className="mt-3 w-full space-y-1">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: `${activeTabInfo.color}12`, color: textPrimary }}>
                    <CheckCircle size={11} style={{ color: "#34d399" }} />
                    <span className="flex-1 truncate">{f}</span>
                    <button onClick={e => { e.stopPropagation(); setUploadedFiles(prev => prev.filter((_, j) => j !== i)); }}>
                      <X size={11} style={{ color: textMuted }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {uploadedFiles.length > 0 && (
            <button className="w-full mt-3 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${activeTabInfo.color}, ${activeTabInfo.color}bb)`, color: "#fff" }}>
              Submit {uploadedFiles.length} File{uploadedFiles.length > 1 ? "s" : ""} for Approval
            </button>
          )}
        </div>

        {/* Stats + Guidelines */}
        <div className="flex flex-col gap-3">
          {/* Upload stats */}
          <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <h3 className="font-semibold mb-3" style={{ color: textPrimary }}>Upload Statistics</h3>
            {[
              { label: "Total Uploads", value: "20", color: textMuted },
              { label: "Approved", value: "15", color: "#34d399" },
              { label: "Pending", value: "3", color: "#f59e0b" },
              { label: "Rejected", value: "2", color: "#ef4444" },
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
              <h3 className="font-semibold text-sm" style={{ color: textPrimary }}>Photo Tips</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Upload high-resolution images",
                "Ensure good lighting and clarity",
                "Photos must show students and achievements",
                "Avoid blurred or irrelevant content",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: textMuted }}>
                  <CheckCircle size={12} style={{ color: "#34d399", flexShrink: 0, marginTop: "1px" }} />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: textPrimary }}>Uploaded {tabs.find(t => t.id === activeTab)?.label}</h3>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(79,127,255,0.12)", color: "#4f7fff" }}>Sort: Latest First</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {gallery.map((item, i) => (
            <div key={i} className="rounded-xl overflow-hidden cursor-pointer group transition-all hover:scale-[1.03]"
              style={{ border: cardBorder }}>
              <div className="h-24 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${photoColors[i % photoColors.length]}30, ${photoColors[(i + 2) % photoColors.length]}20)` }}>
                <Camera size={24} style={{ color: photoColors[i % photoColors.length] }} />
              </div>
              <div className="p-2" style={{ background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
                <div className="text-xs font-medium truncate" style={{ color: textPrimary }}>{item.title}</div>
                <div className="text-xs mt-0.5" style={{ color: textMuted }}>{item.date}</div>
                <span className="text-xs flex items-center gap-1 mt-1 font-medium" style={{ color: statusColor[item.status] }}>
                  {statusIcon[item.status]} {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
