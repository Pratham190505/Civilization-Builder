import { useState } from "react";
import {
  Calendar,
  Eye,
  Download,
  Upload,
  FileText,
  X,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { inspections } from "../../data/regionalAdminMockData.js";

// Status configuration mapping
const statusConfig = {
  Pending: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", icon: Clock },
  Scheduled: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)", icon: Calendar },
  Completed: { color: "#10B981", bg: "rgba(16, 185, 129, 0.1)", icon: CheckCircle2 },
  Generated: { color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)", icon: FileText },
};

export default function Inspections() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [inspectionsList, setInspectionsList] = useState(inspections);

  const filteredInspections = statusFilter === "All"
    ? inspectionsList
    : inspectionsList.filter((item) => item.status === statusFilter);

  const counts = {
    total: inspectionsList.length,
    pending: inspectionsList.filter((item) => item.status === "Pending").length,
    scheduled: inspectionsList.filter((item) => item.status === "Scheduled").length,
    completed: inspectionsList.filter((item) => item.status === "Completed").length,
    generated: inspectionsList.filter((item) => item.status === "Generated").length,
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
    {
      title: "Generated Reports",
      value: counts.generated,
      color: "#8B5CF6",
      bg: "rgba(139, 92, 246, 0.1)",
    },
  ];

  const handleSchedule = (id) => {
    setInspectionsList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Scheduled",
              inspectionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
              inspector: "Dr. K. Shah",
            }
          : item
      )
    );
    // Update active details modal if open
    setSelectedInspection((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            status: "Scheduled",
            inspectionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            inspector: "Dr. K. Shah",
          }
        : prev
    );
  };

  const handleGenerateReport = (id) => {
    setInspectionsList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Generated",
              report: `Report_${id}.pdf`,
            }
          : item
      )
    );
    // Update active details modal if open
    setSelectedInspection((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            status: "Generated",
            report: `Report_${id}.pdf`,
          }
        : prev
    );
  };

  return (
    <div className="space-y-5 regional-admin-theme pb-8 relative">
      {/* 1. Page Header description */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Inspection Reports
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Manage school inspection requests and generated reports
        </p>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
      <div className="flex gap-2 flex-wrap items-center">
        {["All", "Pending", "Scheduled", "Completed", "Generated"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
            style={
              statusFilter === status
                ? {
                    background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                    color: "#fff",
                    border: "1px solid transparent",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                  }
                : {
                    background: "var(--glass-card)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-secondary)",
                  }
            }
          >
            {status}
          </button>
        ))}
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                {["Request ID", "School", "District", "Requested By", "Request Date", "Status", "Inspection Date", "Report", "Actions"].map(
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
                const status = statusConfig[item.status] || statusConfig["Pending"];

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[var(--glass-hover)]"
                    style={{ borderBottom: "1px solid var(--glass-border)" }}
                  >
                    {/* Request ID */}
                    <td className="px-4 py-3.5 text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                      {item.id}
                    </td>

                    {/* School name */}
                    <td className="px-4 py-3.5">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.school}
                      </div>
                    </td>

                    {/* District */}
                    <td className="px-4 py-3.5 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {item.district}
                    </td>

                    {/* Requested By */}
                    <td className="px-4 py-3.5 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {item.requestedBy}
                    </td>

                    {/* Request Date */}
                    <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(item.requestDate).toLocaleDateString("en-IN", {
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
                        <span className="w-1 h-1 rounded-full bg-current" />
                        {item.status}
                      </span>
                    </td>

                    {/* Scheduled Date */}
                    <td className="px-4 py-3.5 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      {item.inspectionDate
                        ? new Date(item.inspectionDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Report Download */}
                    <td className="px-4 py-3.5">
                      {item.report ? (
                        <button
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-90 cursor-pointer"
                          style={{
                            background: "rgba(139,92,246,0.1)",
                            color: "#8B5CF6",
                          }}
                        >
                          <Download className="w-3 h-3" />
                          Download
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
                          className="p-1.5 rounded-lg transition-all cursor-pointer"
                          style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {item.status === "Pending" && (
                          <button
                            onClick={() => handleSchedule(item.id)}
                            className="p-1.5 rounded-lg transition-all cursor-pointer"
                            style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
                            title="Schedule Inspection"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {item.status === "Completed" && (
                          <button
                            onClick={() => handleGenerateReport(item.id)}
                            className="p-1.5 rounded-lg transition-all cursor-pointer"
                            style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6" }}
                            title="Upload Report"
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
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[4px] transition-all"
            onClick={() => setSelectedInspection(null)}
          />

          {/* Slide-out details box */}
          <div
            className="fixed right-0 top-0 h-full w-[420px] max-w-full z-50 flex flex-col shadow-2xl animate-slide-in"
            style={{
              background: "var(--dropdown-bg)",
              backdropFilter: "blur(24px)",
              borderLeft: "1px solid var(--glass-border)",
            }}
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
                  {selectedInspection.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                className="p-2 rounded-xl hover:bg-[var(--glass-hover)] cursor-pointer"
                style={{ color: "var(--text-secondary)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
              {/* Status Indicator badge */}
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

              {/* School Information list cards */}
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
                  { label: "School", value: selectedInspection.school },
                  { label: "District", value: selectedInspection.district },
                  { label: "Requested By", value: selectedInspection.requestedBy },
                  {
                    label: "Request Date",
                    value: new Date(selectedInspection.requestDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                  ...(selectedInspection.inspector
                    ? [{ label: "Inspector", value: selectedInspection.inspector }]
                    : []),
                  ...(selectedInspection.inspectionDate
                    ? [
                        {
                          label: "Inspection Date",
                          value: new Date(selectedInspection.inspectionDate).toLocaleDateString("en-IN", {
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

              {/* Inspection notes */}
              {selectedInspection.notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                    Inspection Notes
                  </h4>
                  <p
                    className="text-xs leading-relaxed p-3.5 rounded-xl"
                    style={{
                      background: "var(--glass-hover)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {selectedInspection.notes}
                  </p>
                </div>
              )}

              {/* Inspection report box */}
              {selectedInspection.report && (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                  }}
                >
                  <FileText className="w-5 h-5 shrink-0" style={{ color: "#8B5CF6" }} />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-bold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {selectedInspection.report}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Final inspection report
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                    }}
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              )}

              {/* Contextual Action Buttons in Slide-out */}
              <div className="space-y-2 pt-4">
                {selectedInspection.status === "Pending" && (
                  <button
                    onClick={() => handleSchedule(selectedInspection.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Inspection
                  </button>
                )}

                {selectedInspection.status === "Completed" && !selectedInspection.report && (
                  <button
                    onClick={() => handleGenerateReport(selectedInspection.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
