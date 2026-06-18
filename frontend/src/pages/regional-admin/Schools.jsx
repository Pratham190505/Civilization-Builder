import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getSchools, getDistricts } from "../../api/schools";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pen
} from "lucide-react";

// Status configuration
const statusConfig = {
  APPROVED: { label: "Approved", color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" },
  REJECTED: { label: "Rejected", color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
  PENDING: { label: "Pending", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" },
  INACTIVE: { label: "Inactive", color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
};

export default function Schools() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schoolsList, setSchoolsList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;
  const stateId = user?.scope?.stateId || (user?.scope?.stateIds && user.scope.stateIds[0]) || 1;

  useEffect(() => {
    async function loadData() {
      try {
        const [schoolsRes, districtsRes] = await Promise.all([
          getSchools(),
          getDistricts()
        ]);
        if (schoolsRes.success) {
          setSchoolsList(schoolsRes.data);
        }
        if (districtsRes.success) {
          setDistrictsList(districtsRes.data);
        }
      } catch (err) {
        console.error("Failed to load schools/districts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter districts list based on regional admin's state scope
  const scopedDistricts = districtsList.filter(d => 
    !stateId || d.state_id === stateId
  );

  const districtOptions = ["All", ...scopedDistricts.map(d => d.district_name)];

  // Filter school items
  const filteredSchools = schoolsList.filter((school) => {
    const nameMatch = school.school_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const principalMatch = school.principal_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const codeMatch = school.school_code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || principalMatch || codeMatch;
    
    const matchesDistrict = districtFilter === "All" || school.District?.district_name === districtFilter;
    const matchesStatus = statusFilter === "All" || school.status === statusFilter;

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading Schools Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 regional-admin-theme pb-8">
      {/* Search & Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search school name, principal or code..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Filters Selects */}
        {[
          {
            label: "District",
            value: districtFilter,
            options: districtOptions,
            onChange: (val) => {
              setDistrictFilter(val);
              setCurrentPage(1);
            },
          },
          {
            label: "Status",
            value: statusFilter,
            options: ["All", "APPROVED", "PENDING", "REJECTED", "INACTIVE"],
            onChange: (val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            },
          },
        ].map((filter) => (
          <select
            key={filter.label}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none transition-all cursor-pointer"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-primary)",
            }}
          >
            {filter.options.map((opt) => (
              <option
                key={opt}
                value={opt}
                style={{ background: "var(--dropdown-bg)" }}
              >
                {opt === "All" ? `All ${filter.label}s` : opt}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* Counters Summary Row */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: "Total", count: schoolsList.length, color: "#3B82F6" },
          { label: "Active", count: schoolsList.filter((s) => s.status === "APPROVED").length, color: "#10B981" },
          { label: "Pending", count: schoolsList.filter((s) => s.status === "PENDING").length, color: "#F59E0B" },
          { label: "Rejected", count: schoolsList.filter((s) => s.status === "REJECTED").length, color: "#EF4444" },
        ].map((counter) => (
          <div
            key={counter.label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: `${counter.color}10`,
              border: `1px solid ${counter.color}20`,
            }}
          >
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {counter.label}:
            </span>
            <span className="text-xs" style={{ color: counter.color, fontWeight: 700 }}>
              {counter.count}
            </span>
          </div>
        ))}
        <span
          className="text-xs self-center ml-auto"
          style={{ color: "var(--text-muted)" }}
        >
          Showing {paginatedSchools.length} of {filteredSchools.length}
        </span>
      </div>

      {/* Table Container */}
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
                {["S.No", "School Name", "District", "School Code", "Principal Name", "Email", "Status", "Registered", "Actions"].map(
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
              {paginatedSchools.map((school, index) => {
                const status = statusConfig[school.status] || statusConfig["PENDING"];
                const sequenceNum = (currentPage - 1) * itemsPerPage + index + 1;

                return (
                  <tr
                    key={school.id}
                    className="transition-colors hover:bg-[var(--glass-hover)]"
                    style={{ borderBottom: "1px solid var(--glass-border)" }}
                  >
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      #{sequenceNum}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {school.school_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {school.District?.district_name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium font-mono" style={{ color: "var(--text-secondary)" }}>
                      {school.school_code}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {school.principal_name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {school.email || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                      {new Date(school.created_at || school.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 rounded-lg transition-all cursor-pointer border-0"
                          style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedSchools.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No schools match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Section */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: "1px solid var(--glass-border)" }}
          >
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg transition-all disabled:opacity-40 cursor-pointer border-0"
                style={{ background: "var(--glass-hover)", color: "var(--text-secondary)" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = currentPage === pageNum;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, #3B82F6, #6366F1)"
                        : "var(--glass-hover)",
                      color: isActive ? "#fff" : "var(--text-secondary)",
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg transition-all disabled:opacity-40 cursor-pointer border-0"
                style={{ background: "var(--glass-hover)", color: "var(--text-secondary)" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
