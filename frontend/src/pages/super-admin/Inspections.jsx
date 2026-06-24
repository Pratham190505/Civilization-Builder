import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getInspectionRequests, scheduleInspection, completeInspection } from "../../api/inspections";
import { getRankTiers } from "../../api/rankings";
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
  Info,
  BarChart2,
  TrendingUp,
  Award
} from "lucide-react";
import { Tier, StatusPill } from "../../components/common/Page.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5003";

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
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("Awaiting Inspection"); // default to Awaiting Inspection
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [requests, setRequests] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({ requestId: "", scheduleDate: "", inspectorId: "2" });

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeData, setCompleteData] = useState({
    reportId: "",
    academic_score: "0",
    achievement_score: "0",
    media_score: "0",
    participation_score: "0",
    feedback: "",
    report_file: null
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, tierRes] = await Promise.all([
        getInspectionRequests(),
        getRankTiers()
      ]);
      if (reqRes.success) {
        setRequests(reqRes.data);
      }
      if (tierRes.success) {
        setTiers(tierRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch inspection data:", err);
      toast.error("Failed to load page data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter requests based on status tabs
  const filteredInspections = requests.filter((item) => {
    if (statusFilter === "Awaiting Inspection") {
      return item.status === "PENDING" || item.status === "SCHEDULED";
    }
    if (statusFilter === "Upcoming Inspections") {
      if (item.status !== "SCHEDULED") return false;
      if (!item.InspectionReport?.inspection_date) return false;
      const reportDate = new Date(item.InspectionReport.inspection_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return reportDate >= today;
    }
    if (statusFilter === "Completed") {
      return item.status === "COMPLETED";
    }
    return true; // "All"
  });

  const counts = {
    total: requests.length,
    awaiting: requests.filter((item) => item.status === "PENDING" || item.status === "SCHEDULED").length,
    upcoming: requests.filter((item) => {
      if (item.status !== "SCHEDULED") return false;
      if (!item.InspectionReport?.inspection_date) return false;
      const reportDate = new Date(item.InspectionReport.inspection_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return reportDate >= today;
    }).length,
    completed: requests.filter((item) => item.status === "COMPLETED").length,
  };

  const statsConfig = [
    {
      title: "Total Inspections",
      value: counts.total,
      icon: BarChart2,
      color: "#3B82F6",
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Awaiting Inspection",
      value: counts.awaiting,
      icon: Clock,
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.1)",
    },
    {
      title: "Completed",
      value: counts.completed,
      icon: CheckCircle2,
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.1)",
    },
  ];

  const handleOpenSchedule = (item) => {
    const existingDate = item.InspectionReport?.inspection_date
      ? new Date(item.InspectionReport.inspection_date).toISOString().slice(0, 10)
      : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      
    const existingInspector = item.InspectionReport?.inspector_id !== undefined
      ? String(item.InspectionReport.inspector_id)
      : "2";

    setScheduleData({
      requestId: item.id,
      scheduleDate: existingDate,
      inspectorId: existingInspector
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
        fetchData();
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
      academic_score: "0",
      achievement_score: "0",
      media_score: "0",
      participation_score: "0",
      feedback: "",
      report_file: null
    });
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      const academic = parseInt(completeData.academic_score || 0, 10);
      const achievement = parseInt(completeData.achievement_score || 0, 10);
      const media = parseInt(completeData.media_score || 0, 10);
      const participation = parseInt(completeData.participation_score || 0, 10);
      const totalScore = academic + achievement + media + participation;

      if (totalScore === 0) {
        toast.error("Total inspection score cannot be zero. Please assign a score.");
        return;
      }

      // Simple frontend checks to align with backend validation
      if (academic < 0 || academic > 300) {
        toast.error("Academic score must be between 0 and 300");
        return;
      }
      if (achievement < 0 || achievement > 300) {
        toast.error("Achievement score must be between 0 and 300");
        return;
      }
      if (media < 0 || media > 300) {
        toast.error("Media score must be between 0 and 300");
        return;
      }
      if (participation < 0 || participation > 100) {
        toast.error("Participation score must be between 0 and 100");
        return;
      }
      if (!completeData.feedback || completeData.feedback.length < 10) {
        toast.error("Please enter feedback findings (min 10 characters)");
        return;
      }

      const formData = new FormData();
      formData.append("reportId", completeData.reportId);
      formData.append("academic_score", academic);
      formData.append("achievement_score", achievement);
      formData.append("media_score", media);
      formData.append("participation_score", participation);
      formData.append("feedback", completeData.feedback);
      if (completeData.report_file) {
        formData.append("report_file", completeData.report_file);
      }

      const res = await completeInspection(formData);

      if (res.success) {
        toast.success("Inspection report uploaded & scores calculated!");
        setShowCompleteModal(false);
        fetchData();
      } else {
        toast.error(res.message || "Failed to complete inspection");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred");
    }
  };

  const handleDownloadReport = (reportFilePath) => {
    if (reportFilePath) {
      const fullUrl = reportFilePath.startsWith("http")
        ? reportFilePath
        : `${API_BASE_URL}${reportFilePath}`;
      window.open(fullUrl, "_blank");
    } else {
      toast.error("Inspection report file not found.");
    }
  };

  // Real-time calculated properties
  const academicVal = parseInt(completeData.academic_score || 0, 10);
  const achievementVal = parseInt(completeData.achievement_score || 0, 10);
  const mediaVal = parseInt(completeData.media_score || 0, 10);
  const participationVal = parseInt(completeData.participation_score || 0, 10);
  const totalScoreVal = academicVal + achievementVal + mediaVal + participationVal;

  const matchedTier = tiers.find(t => totalScoreVal >= t.min_score && totalScoreVal <= t.max_score);
  const matchedTierName = matchedTier ? matchedTier.tier_name : "No Rank";

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-background text-foreground rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading Inspections feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 relative text-foreground">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">
          School Inspections & Ranking Panel
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Exclusive Super Admin control panel for conducting school audits, assigning scores, and dynamically ranking institutions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statsConfig.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl p-5 border border-border bg-surface shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl font-bold mb-1">
                    {card.value}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground">
                    {card.title}
                  </div>
                </div>
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: card.bg, color: card.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Filter Tab Switcher */}
      <div className="flex gap-2 flex-wrap items-center">
        {["Awaiting Inspection", "Upcoming Inspections", "Completed", "All Requests"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
            style={
              statusFilter === tab
                ? {
                    background: "linear-gradient(135deg, var(--color-primary, #3B82F6), #6366F1)",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                    border: "none"
                  }
                : {
                    background: "var(--glass-card)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-secondary)",
                  }
            }
          >
            {tab} ({
              tab === "Awaiting Inspection" ? counts.awaiting :
              tab === "Upcoming Inspections" ? counts.upcoming :
              tab === "Completed" ? counts.completed :
              counts.total
            })
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Request Code", "School", "District & State", "Reason", "Preferred Date", "Status", "Inspection Details", "Report PDF", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-5 py-4.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInspections.map((item) => {
                const status = statusConfig[item.status] || statusConfig["PENDING"];

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-muted/10"
                  >
                    {/* Request Code */}
                    <td className="px-5 py-4 text-xs font-bold font-mono text-muted-foreground">
                      {item.request_code}
                    </td>

                    {/* School Name */}
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold flex items-center gap-2 flex-wrap">
                        <span>{item.School?.school_name}</span>
                        {item.status === "COMPLETED" && (!item.School?.total_score || item.School?.total_score === 0) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500 dark:text-rose-400 border border-rose-500/25">
                            <Info className="w-3 h-3 shrink-0" /> Inconsistent Data (Score 0)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* District & State */}
                    <td className="px-5 py-4">
                      <div className="text-xs font-medium">
                        {item.School?.District?.district_name || "N/A"}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {item.School?.District?.State?.state_name || ""}
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="px-5 py-4 text-xs max-w-[180px] truncate" title={item.request_reason}>
                      {item.request_reason}
                    </td>

                    {/* Preferred Date */}
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {new Date(item.requested_at || item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <StatusPill value={item.status === "PENDING" ? "Pending" : item.status === "SCHEDULED" ? "Scheduled" : "APPROVED"} />
                    </td>

                    {/* Scheduled Details */}
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {item.InspectionReport?.inspection_date
                        ? `Date: ${new Date(item.InspectionReport.inspection_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}`
                        : "Not Scheduled"}
                    </td>

                    {/* Report PDF */}
                    <td className="px-5 py-4">
                      {item.status === "COMPLETED" ? (
                        <button
                          onClick={() => handleDownloadReport(item.InspectionReport?.report_file_path)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-violet-500/25 border-none cursor-pointer bg-violet-500/10 text-violet-300"
                        >
                          <Download className="w-3.5 h-3.5" />
                          View PDF
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInspection(item)}
                          className="p-2 rounded-lg transition-all hover:bg-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none cursor-pointer"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(item.status === "PENDING" || item.status === "SCHEDULED") && (
                          <button
                            onClick={() => handleOpenSchedule(item)}
                            className="p-2 rounded-lg transition-all hover:bg-amber-500/20 bg-amber-500/10 text-amber-400 border-none cursor-pointer"
                            title={item.status === "SCHEDULED" ? "Reschedule Inspection" : "Schedule Inspection"}
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}

                        {item.status === "SCHEDULED" && (
                          <button
                            onClick={() => handleOpenComplete(item)}
                            className="p-2 rounded-lg transition-all hover:bg-emerald-500/20 bg-emerald-500/10 text-emerald-400 border-none cursor-pointer"
                            title="Complete Report"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInspections.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                    No inspection requests found matching "{statusFilter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* School details side panel */}
      {selectedInspection && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[4px] transition-all"
            onClick={() => setSelectedInspection(null)}
          />

          <div
            className="fixed right-0 top-0 h-full w-[450px] max-w-full z-50 flex flex-col shadow-2xl animate-slide-in"
            style={overlayStyle}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Inspection School Details
                </h3>
                <p className="text-xs font-mono font-bold mt-0.5 text-muted-foreground">
                  Request: {selectedInspection.request_code}
                </p>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
              <div>
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
              </div>

              {/* School Basic Details Card */}
              <div className="rounded-xl p-5 space-y-4 border border-border bg-muted/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  School Information
                </h4>
                {[
                  { label: "School Name", value: selectedInspection.School?.school_name },
                  { label: "Address", value: selectedInspection.School?.address || "N/A" },
                  { label: "Principal", value: selectedInspection.School?.principal_name || "N/A" },
                  { label: "Contact Phone", value: selectedInspection.School?.contact_phone || "N/A" },
                  { label: "Contact Email", value: selectedInspection.School?.contact_email || "N/A" },
                  { label: "State", value: selectedInspection.School?.District?.State?.state_name || "N/A" },
                  { label: "District", value: selectedInspection.School?.District?.district_name || "N/A" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-start text-xs gap-3">
                    <span className="text-muted-foreground shrink-0">{item.label}</span>
                    <span className="font-semibold text-right">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Stats and Rankings (If completed) */}
              {selectedInspection.status === "COMPLETED" && (
                <div className="rounded-xl p-5 space-y-4 border border-border bg-muted/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Assigned Performance Scores
                  </h4>
                  {[
                    { label: "Academic Score", value: `${selectedInspection.School?.academic_score || 0} / 300` },
                    { label: "Achievement Score", value: `${selectedInspection.School?.achievement_score || 0} / 300` },
                    { label: "Media Score", value: `${selectedInspection.School?.media_score || 0} / 300` },
                    { label: "Participation Score", value: `${selectedInspection.School?.participation_score || 0} / 100` },
                    { label: "Total Score Sum", value: `${selectedInspection.School?.total_score || 0} / 1000` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">Assigned Tier</span>
                    <Tier value={selectedInspection.School?.RankTier?.tier_name || "No Rank"} />
                  </div>
                </div>
              )}

              {/* Request Context Card */}
              <div className="rounded-xl p-5 space-y-3 border border-border bg-muted/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Audit/Request Details
                </h4>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Reason for Audit Request</span>
                  <p className="text-xs italic bg-surface/50 p-2.5 rounded-lg border border-border">
                    "{selectedInspection.request_reason}"
                  </p>
                </div>
                {[
                  {
                    label: "Requested On",
                    value: new Date(selectedInspection.requested_at || selectedInspection.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                  ...(selectedInspection.InspectionReport?.inspector_id
                    ? [
                        {
                          label: "Assigned Inspector ID",
                          value: selectedInspection.InspectionReport.inspector_id,
                        },
                      ]
                    : []),
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Findings text */}
              {selectedInspection.InspectionReport?.findings && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Inspector Findings Feedback
                  </h4>
                  <p className="text-xs leading-relaxed p-4 rounded-xl border border-border bg-muted/30 whitespace-pre-line">
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
          <div className="w-full max-w-md p-6 rounded-2xl space-y-5" style={overlayStyle}>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Schedule Inspection</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="border-none bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Inspection Audit Date</label>
                <input
                  type="date"
                  required
                  value={scheduleData.scheduleDate}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border border-border bg-surface text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Assigned Inspector ID</label>
                <input
                  type="number"
                  required
                  value={scheduleData.inspectorId}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, inspectorId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border border-border bg-surface text-foreground"
                />
              </div>
              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-muted-foreground bg-transparent hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer border-none"
                  style={{ background: "linear-gradient(135deg, var(--color-primary, #3B82F6), #6366F1)" }}
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Audit Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-[2px]">
          <div className="w-full max-w-lg p-6 rounded-2xl space-y-5 max-h-[90vh] overflow-y-auto scrollbar-thin" style={overlayStyle}>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Upload Audit & Assign Scores</h3>
                <p className="text-xs text-muted-foreground">Set metrics for school rankings. 0-1000 scale.</p>
              </div>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="border-none bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              
              {/* Category Scores Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                    <span>Academic Score</span>
                    <span className="text-[10px] opacity-75">Max 300</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    required
                    value={completeData.academic_score}
                    onChange={(e) => setCompleteData(prev => ({ ...prev, academic_score: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border border-border bg-surface text-foreground font-semibold"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                    <span>Achievements Score</span>
                    <span className="text-[10px] opacity-75">Max 300</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    required
                    value={completeData.achievement_score}
                    onChange={(e) => setCompleteData(prev => ({ ...prev, achievement_score: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border border-border bg-surface text-foreground font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                    <span>Media Score</span>
                    <span className="text-[10px] opacity-75">Max 300</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    required
                    value={completeData.media_score}
                    onChange={(e) => setCompleteData(prev => ({ ...prev, media_score: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border border-border bg-surface text-foreground font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                    <span>Participation Score</span>
                    <span className="text-[10px] opacity-75">Max 100</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={completeData.participation_score}
                    onChange={(e) => setCompleteData(prev => ({ ...prev, participation_score: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border border-border bg-surface text-foreground font-semibold"
                  />
                </div>
              </div>

              {/* Real-time Ticker Panel */}
              <div className="rounded-xl p-4 flex items-center justify-between border border-border bg-muted/30">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calculated Rating</div>
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{totalScoreVal} / 1000 Points</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Matching Tier</div>
                  <div className="mt-0.5">
                    <Tier value={matchedTierName} />
                  </div>
                </div>
              </div>

              {/* Upload report file */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Upload Audit Report PDF (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer text-xs font-semibold transition-all">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>{completeData.report_file ? completeData.report_file.name : "Select PDF File"}</span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCompleteData(prev => ({ ...prev, report_file: e.target.files[0] }));
                        }
                      }}
                    />
                  </label>
                  {completeData.report_file && (
                    <button
                      type="button"
                      onClick={() => setCompleteData(prev => ({ ...prev, report_file: null }))}
                      className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border-none cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback and findings */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Findings & Audit Feedback</label>
                <textarea
                  required
                  rows={4}
                  value={completeData.feedback}
                  onChange={(e) => setCompleteData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Enter detailed audit findings (min 10 characters)..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none border border-border bg-surface text-foreground"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-muted-foreground bg-transparent hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer border-none"
                  style={{ background: "linear-gradient(135deg, var(--color-success, #10B981), #059669)" }}
                >
                  Approve & Submit Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
