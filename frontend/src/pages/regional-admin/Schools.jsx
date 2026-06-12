import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pen
} from "lucide-react";
import { schools } from "../../data/regionalAdminMockData.js";

// Category configuration
const categoryConfig = {
  Platinum: {
    label: "Platinum",
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.1)",
    stars: 5,
  },
  Gold: {
    label: "Gold",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
    stars: 4,
  },
  Silver: {
    label: "Silver",
    color: "#6B7280",
    bg: "rgba(107, 114, 128, 0.1)",
    stars: 3,
  },
  Bronze: {
    label: "Bronze",
    color: "#CD7F32",
    bg: "rgba(205, 127, 50, 0.1)",
    stars: 2,
  },
  "No Rank": {
    label: "No Rank",
    color: "#94A3B8",
    bg: "rgba(148, 163, 184, 0.1)",
    stars: 1,
  },
};

// Status configuration
const statusConfig = {
  Active: { color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" },
  Inactive: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
  Pending: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" },
};

// Star Renderer Component
function StarsRenderer({ count }) {
  return (
    <span style={{ letterSpacing: "1px" }} className="ml-1 inline-flex">
      {Array.from({ length: 5 }).map((_, r) => (
        <span
          key={r}
          style={{
            color: r < count ? "#F59E0B" : "var(--text-muted)",
            fontSize: "11px",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function Schools() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  // Filter school items
  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.principal.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDistrict = districtFilter === "All" || school.district === districtFilter;
    const matchesStatus = statusFilter === "All" || school.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || school.category === categoryFilter;

    return matchesSearch && matchesDistrict && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Extract unique districts list
  const districtOptions = ["All", ...Array.from(new Set(schools.map((s) => s.district)))];

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
            placeholder="Search schools..."
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
            options: ["All", "Active", "Inactive", "Pending"],
            onChange: (val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            },
          },
          {
            label: "Category",
            value: categoryFilter,
            options: ["All", "Platinum", "Gold", "Silver", "Bronze", "No Rank"],
            onChange: (val) => {
              setCategoryFilter(val);
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
          { label: "Total", count: schools.length, color: "#3B82F6" },
          { label: "Active", count: schools.filter((s) => s.status === "Active").length, color: "#10B981" },
          { label: "Inactive", count: schools.filter((s) => s.status === "Inactive").length, color: "#EF4444" },
          { label: "Pending", count: schools.filter((s) => s.status === "Pending").length, color: "#F59E0B" },
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
                {["Rank", "School Name", "District", "City", "Principal", "Category", "Status", "Created", "Actions"].map(
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
              {paginatedSchools.map((school) => {
                const category = categoryConfig[school.category] || categoryConfig["No Rank"];
                const status = statusConfig[school.status] || statusConfig["Pending"];

                return (
                  <tr
                    key={school.id}
                    className="transition-colors hover:bg-[var(--glass-hover)]"
                    style={{ borderBottom: "1px solid var(--glass-border)" }}
                  >
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      #{school.rank}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {school.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {school.district}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {school.city}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {school.principal}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5"
                        style={{ background: category.bg, color: category.color }}
                      >
                        {category.label}
                        <StarsRenderer count={category.stars} />
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {school.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                      {new Date(school.createdDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 rounded-lg transition-all cursor-pointer"
                          style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg transition-all cursor-pointer"
                          style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}
                          title="Edit"
                        >
                          <Pen className="w-3.5 h-3.5" />
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
                className="p-1.5 rounded-lg transition-all disabled:opacity-40 cursor-pointer"
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
                    className="w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer"
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
                className="p-1.5 rounded-lg transition-all disabled:opacity-40 cursor-pointer"
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
