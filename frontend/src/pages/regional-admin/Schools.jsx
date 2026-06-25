import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getSchools, getDistricts, getSchoolById } from "../../api/schools";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pen,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  ExternalLink,
  X
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
  const [socialMediaFilter, setSocialMediaFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Details Modal
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [schoolDetails, setSchoolDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
    
    const hasSocialMedia = school.facebook_url || school.instagram_url || school.youtube_url || school.website_url;
    const matchesSocialMedia = socialMediaFilter === "All" || 
      (socialMediaFilter === "With Social Media" && hasSocialMedia) ||
      (socialMediaFilter === "Without Social Media" && !hasSocialMedia);

    return matchesSearch && matchesDistrict && matchesStatus && matchesSocialMedia;
  });

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = async (id) => {
    setSelectedSchoolId(id);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setSchoolDetails(null);
    try {
      const res = await getSchoolById(id);
      if (res.success) {
        setSchoolDetails(res.data);
      } else {
        setShowDetailsModal(false);
      }
    } catch (err) {
      console.error("Error loading details:", err);
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

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
      <div 
        className="sticky top-[-24px] z-10 -mt-6 -mx-6 px-6 pt-6 pb-4 mb-3 border-b border-border"
        style={{ background: "var(--background)" }}
      >
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
            {
              label: "Social Media",
              value: socialMediaFilter,
              options: ["All", "With Social Media", "Without Social Media"],
              onChange: (val) => {
                setSocialMediaFilter(val);
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
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-340px)] min-h-[300px]">
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
                          onClick={() => handleViewDetails(school.id)}
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

      {/* School Details Modal */}
      {showDetailsModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-hidden">
          <div className="w-full max-w-4xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4 bg-surface">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {loadingDetails ? "Loading School Profile..." : schoolDetails?.school_name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {loadingDetails ? "Fetching database relations..." : `School Code: ${schoolDetails?.school_code || "N/A"} · Status: ${schoolDetails?.status || "PENDING"}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSchoolDetails(null);
                }}
                className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer border-0 bg-transparent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <p className="text-xs text-muted-foreground">Retrieving school details...</p>
              </div>
            ) : (
              <>
                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">School & Contact Details</h4>
                      <div className="space-y-1.5 rounded-xl border border-border p-4 bg-muted/30 text-sm">
                        <div><span className="text-muted-foreground">School Name:</span> <span className="font-semibold text-foreground">{schoolDetails?.school_name || "N/A"}</span></div>
                        <div><span className="text-muted-foreground">School Code:</span> <span className="font-mono text-xs font-semibold text-foreground">{schoolDetails?.school_code || "N/A"}</span></div>
                        <div><span className="text-muted-foreground">UDISE Code:</span> <span className="font-mono text-xs font-semibold text-foreground">{schoolDetails?.udise_code || "N/A"}</span></div>
                        <div><span className="text-muted-foreground">School Type:</span> <span className="text-foreground">{schoolDetails?.school_type || "N/A"}</span></div>
                        <div><span className="text-muted-foreground">Affiliation Board:</span> <span className="text-foreground">{schoolDetails?.affiliation_board || "N/A"}</span></div>
                        <div><span className="text-muted-foreground">Email Address:</span> <span className="text-foreground">{schoolDetails?.email || "N/A"}</span></div>
                        <div><span className="text-muted-foreground">Mobile Contact:</span> <span className="text-foreground">{schoolDetails?.mobile || "N/A"}</span></div>
                        {schoolDetails?.website && (
                          <div><span className="text-muted-foreground">Website:</span> <a href={schoolDetails.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{schoolDetails.website}</a></div>
                        )}
                        {schoolDetails?.website_url && (
                          <div><span className="text-muted-foreground">Website URL:</span> <a href={schoolDetails.website_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{schoolDetails.website_url}</a></div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Location & Principal</h4>
                      <div className="space-y-1.5 rounded-xl border border-border p-4 bg-muted/30 text-sm">
                        <div><span className="text-muted-foreground">Principal Name:</span> <span className="font-semibold text-foreground">{schoolDetails?.principal_name || "N/A"}</span></div>
                        <div><span className="text-muted-foreground">Qualification:</span> <span className="text-foreground">{schoolDetails?.principal_qualification || "N/A"}</span></div>
                        <div><span className="text-muted-foreground">Principal Email:</span> <span className="text-foreground">{schoolDetails?.principal_email || "N/A"}</span></div>
                        <div><span className="text-muted-foreground">Principal Mobile:</span> <span className="text-foreground">{schoolDetails?.principal_mobile || "N/A"}</span></div>
                        <div className="pt-2 border-t border-border mt-2">
                          <div><span className="text-muted-foreground">Address:</span> <span className="text-foreground">{schoolDetails?.address || "N/A"}</span></div>
                          <div><span className="text-muted-foreground">Taluka/City:</span> <span className="text-foreground">{schoolDetails?.taluka || schoolDetails?.city || "N/A"}</span></div>
                          <div><span className="text-muted-foreground">District:</span> <span className="text-foreground">{schoolDetails?.District?.district_name || "N/A"}</span></div>
                          <div><span className="text-muted-foreground">State Coverage:</span> <span className="text-foreground">{schoolDetails?.District?.State?.state_name || "N/A"}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Infrastructure */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Student & Teacher Strengths</h4>
                      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border p-4 bg-muted/30 text-xs">
                        <div><span className="text-muted-foreground">Total Students:</span> <div className="text-sm font-bold text-foreground">{schoolDetails?.student_count || 0}</div></div>
                        <div><span className="text-muted-foreground">Total Teachers:</span> <div className="text-sm font-bold text-foreground">{schoolDetails?.teacher_count || 0}</div></div>
                        <div><span className="text-muted-foreground">Boys:</span> <div className="text-foreground">{schoolDetails?.boys_count || 0}</div></div>
                        <div><span className="text-muted-foreground">Girls:</span> <div className="text-foreground">{schoolDetails?.girls_count || 0}</div></div>
                        <div><span className="text-muted-foreground">Male Teachers:</span> <div className="text-foreground">{schoolDetails?.male_teachers_count || 0}</div></div>
                        <div><span className="text-muted-foreground">Female Teachers:</span> <div className="text-foreground">{schoolDetails?.female_teachers_count || 0}</div></div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Campus Infrastructure</h4>
                      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border p-4 bg-muted/30 text-xs">
                        <div><span className="text-muted-foreground">Classrooms:</span> <div className="font-semibold text-foreground">{schoolDetails?.classrooms_count || 0} rooms</div></div>
                        <div><span className="text-muted-foreground">Labs:</span> <div className="font-semibold text-foreground">{schoolDetails?.labs_count || 0} labs</div></div>
                        <div><span className="text-muted-foreground">Computer Labs:</span> <div className="font-semibold text-foreground">{schoolDetails?.computer_labs_count || 0} rooms</div></div>
                        <div><span className="text-muted-foreground">Smart Classes:</span> <div className="font-semibold text-foreground">{schoolDetails?.smart_classrooms_count || 0} rooms</div></div>
                        <div><span className="text-muted-foreground">Library:</span> <div className="font-semibold text-foreground">{schoolDetails?.library_available ? "Available" : "No"}</div></div>
                        <div><span className="text-muted-foreground">Playground:</span> <div className="font-semibold text-foreground">{schoolDetails?.playground_available ? "Available" : "No"}</div></div>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Social Media Presence</h4>
                    <div className="rounded-xl border border-border p-4 bg-muted/30">
                      {schoolDetails?.facebook_url || schoolDetails?.instagram_url || schoolDetails?.youtube_url || schoolDetails?.website_url ? (
                        <div className="flex flex-wrap gap-3">
                          {schoolDetails?.facebook_url && (
                            <a
                              href={schoolDetails.facebook_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-semibold"
                            >
                              <Facebook className="w-4 h-4" />
                              <span>Facebook</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {schoolDetails?.instagram_url && (
                            <a
                              href={schoolDetails.instagram_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 transition-all text-xs font-semibold"
                            >
                              <Instagram className="w-4 h-4" />
                              <span>Instagram</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {schoolDetails?.youtube_url && (
                            <a
                              href={schoolDetails.youtube_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-xs font-semibold"
                            >
                              <Youtube className="w-4 h-4" />
                              <span>YouTube</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {schoolDetails?.website_url && (
                            <a
                              href={schoolDetails.website_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-semibold"
                            >
                              <Globe className="w-4 h-4" />
                              <span>Website</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground italic">No social media links provided</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4 bg-surface flex justify-end">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSchoolDetails(null);
                    }}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90 cursor-pointer border-0"
                  >
                    Close Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
