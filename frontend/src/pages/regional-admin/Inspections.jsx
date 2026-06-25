import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getInspectionRequests, scheduleInspection, completeInspection } from "../../api/inspections";
import { toast } from "sonner";
import {
  Calendar,
  Eye,
  Download,
  Upload,
  FileText,
  X,
  CheckCircle2,
  Clock,
  Info
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5003";

// Status configuration mapping
const statusConfig = {
  PENDING: { label: "Pending", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", icon: Clock },
  SCHEDULED: { label: "Scheduled", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)", icon: Calendar },
  COMPLETED: { label: "Completed", color: "#10B981", bg: "rgba(16, 185, 129, 0.1)", icon: CheckCircle2 },
};

const overlayStyle = {
  background: "var(--glass-card)",
  backdropFilter: "blur(24px)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--card-shadow)",
};

export default function Inspections() {
  const { user, role } = useAuth();
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({ requestId: "", scheduleDate: "", inspectorId: "2" });

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeData, setCompleteData] = useState({ reportId: "", score: "", feedback: "" });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getInspectionRequests();
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch inspection requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredInspections = statusFilter === "All"
    ? requests
    : requests.filter((item) => item.status === statusFilter);

  const counts = {
    total: requests.length,
    pending: requests.filter((item) => item.status === "PENDING").length,
    scheduled: requests.filter((item) => item.status === "SCHEDULED").length,
    completed: requests.filter((item) => item.status === "COMPLETED").length,
  };

  const statsConfig = [
    {
      title: "Total Requests",
      value: counts.total,
      color: "#3B82F6",
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Pending",
      value: counts.pending,
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.1)",
    },
    {
      title: "Scheduled",
      value: counts.scheduled,
      color: "#3B82F6",
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Completed",
      value: counts.completed,
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.1)",
    },
  ];

  const handleOpenSchedule = (item) => {
    setScheduleData({
      requestId: item.id,
      scheduleDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      inspectorId: "2" // default to regional admin user ID
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await scheduleInspection({
        requestId: parseInt(scheduleData.requestId, 10),
        inspectorId: parseInt(scheduleData.inspectorId, 10),
        scheduleDate: scheduleData.scheduleDate
      });

      if (res.success) {
        toast.success("Inspection scheduled successfully!");
        setShowScheduleModal(false);
        fetchRequests();
      } else {
        toast.error(res.message || "Failed to schedule inspection");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred");
    }
  };

  const handleOpenComplete = (item) => {
    if (!item.InspectionReport?.id) {
      toast.error("No scheduled report found to complete.");
      return;
    }
    setCompleteData({
      reportId: item.InspectionReport.id,
      score: "85",
      feedback: "All categories validated successfully."
    });
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await completeInspection({
        reportId: parseInt(completeData.reportId, 10),
        score: parseInt(completeData.score, 10),
        feedback: completeData.feedback
      });

      if (res.success) {
        toast.success("Inspection report uploaded & scores calculated!");
        setShowCompleteModal(false);
        fetchRequests();
      } else {
        toast.error(res.message || "Failed to complete inspection");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred");
    }
  };

  const handleDownloadReport = (reportFileUrl) => {
    if (reportFileUrl) {
      const fullUrl = reportFileUrl.startsWith("http")
        ? reportFileUrl
        : `${API_BASE_URL}${reportFileUrl}`;
      window.open(fullUrl, "_blank");
    } else {
      toast.error("Report URL not found.");
    }
  };

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading Inspections feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 regional-admin-theme pb-8 relative">
      {/* 1. Page Header description */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Inspection Reports
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Manage school inspection requests and generate scores/PDFs
        </p>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsConfig.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl p-4"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div
              className="text-xl font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {card.value}
            </div>
            <div
              className="text-xs font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              {card.title}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Status Filters switcher */}
      <div 
        className="sticky top-[-24px] z-10 -mt-6 -mx-6 px-6 pt-6 pb-4 mb-3 border-b border-border"
        style={{ background: "var(--background)" }}
      >
        <div className="flex gap-2 flex-wrap items-center">
          {["All", "PENDING", "SCHEDULED", "COMPLETED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer border-0"
              style={
                statusFilter === status
                  ? {
                      background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                      color: "#fff",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                    }
                  : {
                      background: "var(--glass-card)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-secondary)",
                    }
              }
            >
              {status === "All" ? "All Requests" : status}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Table Container */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--glass-card)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(20px)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-420px)] min-h-[300px]">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                {["Request Code", "School", "District", "Reason", "Preferred Date", "Status", "Inspection Date", "Report PDF", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs whitespace-nowrap"
                      style={{ color: "var(--text-muted)", fontWeight: 600 }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredInspections.map((item) => {
                const status = statusConfig[item.status] || statusConfig["PENDING"];

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[var(--glass-hover)]"
                    style={{ borderBottom: "1px solid var(--glass-border)" }}
                  >
                    {/* Request Code */}
                    <td className="px-4 py-3.5 text-xs font-bold font-mono" style={{ color: "var(--text-muted)" }}>
                      {item.request_code}
                    </td>

                    {/* School name */}
                    <td className="px-4 py-3.5">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.School?.school_name}
                      </div>
                    </td>

                    {/* District */}
                    <td className="px-4 py-3.5 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {item.School?.District?.district_name || "N/A"}
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-3.5 text-xs font-medium truncate max-w-[150px]" style={{ color: "var(--text-secondary)" }}>
                      {item.request_reason}
                    </td>

                    {/* Request Date */}
                    <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(item.requested_at || item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                        style={{ background: status.bg, color: status.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {item.status}
                      </span>
                    </td>

                    {/* Scheduled Date */}
                    <td className="px-4 py-3.5 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      {item.InspectionReport?.inspection_date
                        ? new Date(item.InspectionReport.inspection_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Report Download */}
                    <td className="px-4 py-3.5">
                      {item.status === "COMPLETED" ? (
                        <button
                          onClick={() => handleDownloadReport(item.InspectionReport?.findings)} // findings stores feedback/url, or we can use dynamic link
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-90 cursor-pointer border-0"
                          style={{
                            background: "rgba(139,92,246,0.1)",
                            color: "#8B5CF6",
                          }}
                        >
                          <Download className="w-3 h-3" />
                          View PDF
                        </button>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInspection(item)}
                          className="p-1.5 rounded-lg transition-all cursor-pointer border-0"
                          style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {role === "super" && item.status === "PENDING" && (
                          <button
                            onClick={() => handleOpenSchedule(item)}
                            className="p-1.5 rounded-lg transition-all cursor-pointer border-0"
                            style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
                            title="Schedule Inspection"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {role === "super" && item.status === "SCHEDULED" && (
                          <button
                            onClick={() => handleOpenComplete(item)}
                            className="p-1.5 rounded-lg transition-all cursor-pointer border-0"
                            style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}
                            title="Complete Report"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInspections.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No inspection requests found matching this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Slide-out Panel Overlay */}
      {selectedInspection && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[4px] transition-all"
            onClick={() => setSelectedInspection(null)}
          />

          <div
            className="fixed right-0 top-0 h-full w-[420px] max-w-full z-50 flex flex-col shadow-2xl animate-slide-in"
            style={overlayStyle}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-6"
              style={{ borderBottom: "1px solid var(--glass-border)" }}
            >
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  Inspection Details
                </h3>
                <p className="text-xs font-mono font-bold mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {selectedInspection.request_code}
                </p>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                className="p-2 rounded-xl hover:bg-[var(--glass-hover)] cursor-pointer border-0"
                style={{ color: "var(--text-secondary)", background: "transparent" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
                style={{
                  background: statusConfig[selectedInspection.status]?.bg || "rgba(0,0,0,0.1)",
                  color: statusConfig[selectedInspection.status]?.color || "#000",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {selectedInspection.status}
              </span>

              {/* School Information */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "var(--glass-hover)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                  School Information
                </h4>
                {[
                  { label: "School", value: selectedInspection.School?.school_name },
                  { label: "District", value: selectedInspection.School?.District?.district_name || "N/A" },
                  { label: "Request Reason", value: selectedInspection.request_reason },
                  {
                    label: "Requested Date",
                    value: new Date(selectedInspection.requested_at || selectedInspection.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                  ...(selectedInspection.InspectionReport?.inspection_date
                    ? [
                        {
                          label: "Inspection Date",
                          value: new Date(selectedInspection.InspectionReport.inspection_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }),
                        },
                      ]
                    : []),
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center text-xs">
                    <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {selectedInspection.InspectionReport?.findings && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                    Report Findings
                  </h4>
                  <p
                    className="text-xs leading-relaxed p-3.5 rounded-xl font-mono"
                    style={{
                      background: "var(--glass-hover)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {selectedInspection.InspectionReport.findings}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-[2px]">
          <div className="w-full max-w-md p-6 rounded-2xl space-y-4" style={overlayStyle}>
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Schedule Inspection Date</h3>
              <button onClick={() => setShowScheduleModal(false)} className="border-0 bg-transparent text-[var(--text-muted)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Inspection Date</label>
                <input
                  type="date"
                  required
                  value={scheduleData.scheduleDate}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-border"
                  style={{ background: "var(--glass-card)", color: "var(--text-primary)" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Assigned Inspector ID</label>
                <input
                  type="number"
                  required
                  value={scheduleData.inspectorId}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, inspectorId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-border"
                  style={{ background: "var(--glass-card)", color: "var(--text-primary)" }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-[var(--text-secondary)] cursor-pointer bg-transparent">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer border-0" style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}>
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-[2px]">
          <div className="w-full max-w-md p-6 rounded-2xl space-y-4" style={overlayStyle}>
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Upload Findings & Rate School</h3>
              <button onClick={() => setShowCompleteModal(false)} className="border-0 bg-transparent text-[var(--text-muted)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Overall Score (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={completeData.score}
                  onChange={(e) => setCompleteData(prev => ({ ...prev, score: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none border border-border"
                  style={{ background: "var(--glass-card)", color: "var(--text-primary)" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Feedback Findings</label>
                <textarea
                  required
                  rows={3}
                  value={completeData.feedback}
                  onChange={(e) => setCompleteData(prev => ({ ...prev, feedback: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none border border-border"
                  style={{ background: "var(--glass-card)", color: "var(--text-primary)" }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCompleteModal(false)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-[var(--text-secondary)] cursor-pointer bg-transparent">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer border-0" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
