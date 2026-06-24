import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineArrowRightOnRectangle, HiOutlineEye, HiCheck, HiXMark } from "react-icons/hi2";
import { Facebook, Instagram, Youtube, Globe, ExternalLink } from "lucide-react";
import { Card, CardHeader, Tier, StatusPill } from "../../components/common/Page.jsx";
import { getSchools, approveSchool, rejectSchool, getSchoolById, updateSchool } from "../../api/schools";
import { useAuth } from "../../hooks/useAuth.jsx";
import { toast } from "sonner";

export default function Schools() {
  const navigate = useNavigate();
  const { startImpersonation } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [socialMediaFilter, setSocialMediaFilter] = useState("All");

  // Details Modal
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [schoolDetails, setSchoolDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // "profile", "inspections", "media", "rankings"
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [savingScores, setSavingScores] = useState(false);
  const [editScores, setEditScores] = useState({
    academic_score: 0,
    achievement_score: 0,
    media_score: 0,
    participation_score: 0,
  });
  const handleViewDetails = async (id) => {
    setSelectedSchoolId(id);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setSchoolDetails(null);
    setIsEditingScores(false);
    try {
      const res = await getSchoolById(id);
      if (res.success) {
        setSchoolDetails(res.data);
      } else {
        toast.error("Failed to load school details");
        setShowDetailsModal(false);
      }
    } catch (err) {
      toast.error("Error loading details: " + err.message);
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStartEditScores = () => {
    setEditScores({
      academic_score: schoolDetails?.academic_score || 0,
      achievement_score: schoolDetails?.achievement_score || 0,
      media_score: schoolDetails?.media_score || 0,
      participation_score: schoolDetails?.participation_score || 0,
    });
    setIsEditingScores(true);
  };

  const handleSaveScores = async () => {
    const acad = parseInt(editScores.academic_score, 10);
    const ach = parseInt(editScores.achievement_score, 10);
    const med = parseInt(editScores.media_score, 10);
    const part = parseInt(editScores.participation_score, 10);

    if (isNaN(acad) || acad < 0 || acad > 300) {
      toast.error("Academic score must be between 0 and 300");
      return;
    }
    if (isNaN(ach) || ach < 0 || ach > 300) {
      toast.error("Achievement score must be between 0 and 300");
      return;
    }
    if (isNaN(med) || med < 0 || med > 300) {
      toast.error("Media score must be between 0 and 300");
      return;
    }
    if (isNaN(part) || part < 0 || part > 100) {
      toast.error("Participation score must be between 0 and 100");
      return;
    }

    setSavingScores(true);
    try {
      const res = await updateSchool(schoolDetails.id, {
        academic_score: acad,
        achievement_score: ach,
        media_score: med,
        participation_score: part,
      });

      if (res.success) {
        toast.success("Scores updated and rankings recalculated successfully!");
        setIsEditingScores(false);
        const detailsRes = await getSchoolById(schoolDetails.id);
        if (detailsRes.success) {
          setSchoolDetails(detailsRes.data);
        }
        loadData();
      } else {
        toast.error(res.message || "Failed to update scores");
      }
    } catch (err) {
      toast.error("Error updating scores: " + err.message);
    } finally {
      setSavingScores(false);
    }
  };

  const loadData = async () => {
    try {
      const schoolsRes = await getSchools();
      if (schoolsRes.success) setSchools(schoolsRes.data);
    } catch (err) {
      toast.error("Failed to load schools metadata");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await approveSchool(id, "Onboarding criteria verified and approved.");
      if (res.success) {
        toast.success("School onboarding request approved successfully!");
        loadData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to approve school");
    }
  };

  const handleReject = async (id) => {
    const comments = window.prompt("Enter reason for onboarding rejection:");
    if (comments === null) return; // cancel click
    try {
      const res = await rejectSchool(id, comments || "Criteria verification failed.");
      if (res.success) {
        toast.success("School onboarding request rejected.");
        loadData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to reject school");
    }
  };



  // Login as School Admin (impersonation lookup mapping)
  const handleLoginAs = async (school) => {
    try {
      const mapping = school.SchoolAdminMappings?.[0];
      const adminUserId = mapping?.user_id || mapping?.User?.id;
      if (!adminUserId) {
        toast.error("No School Admin mapped to this school yet in the database.");
        return;
      }
      await startImpersonation(adminUserId);
      window.location.href = "/school-admin";
    } catch (err) {
      toast.error("Impersonation failed: " + err.message);
    }
  };

  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      (s.school_name || "").toLowerCase().includes(q.toLowerCase()) ||
      (s.school_code || "").toLowerCase().includes(q.toLowerCase());

    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && s.status === statusFilter.toUpperCase();
  });

  const filteredBySocialMedia = filteredSchools.filter((s) => {
    if (socialMediaFilter === "All") return true;
    const hasSocialMedia = s.facebook_url || s.instagram_url || s.youtube_url || s.website_url;
    return socialMediaFilter === "With Social Media" ? hasSocialMedia : !hasSocialMedia;
  });



  return (
    <Card>
      <CardHeader
        title="School Management"
        subtitle={`${schools.length} schools across India`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate("/schools/add")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg cursor-pointer hover:opacity-90"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" /> Add School
            </button>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
              {["All", "Pending", "Approved", "Rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    statusFilter === f ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
              {["All", "With Social Media", "Without Social Media"].map((f) => (
                <button
                  key={f}
                  onClick={() => setSocialMediaFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    socialMediaFilter === f ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search school…"
                className="w-48 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 text-left">School Name</th>
              <th className="px-5 py-3 text-left">Code</th>
              <th className="px-5 py-3 text-left">State</th>
              <th className="px-5 py-3 text-left">District/City</th>
              <th className="px-5 py-3 text-left">Principal</th>
              <th className="px-5 py-3 text-left">Students/Teachers</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBySocialMedia.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-white/5 transition">
                <td className="px-5 py-3 font-medium text-foreground">
                  <button 
                    onClick={() => handleViewDetails(s.id)}
                    className="hover:underline text-blue-600 dark:text-blue-400 font-medium bg-transparent border-0 cursor-pointer p-0 text-left text-sm"
                  >
                    {s.school_name}
                  </button>
                </td>
                <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{s.school_code}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {s.District?.State?.state_name || s.District?.State?.name || "N/A"}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{s.District?.district_name || "N/A"}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.principal_name || "N/A"}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {s.student_count} S / {s.teacher_count} T
                </td>
                <td className="px-5 py-3">
                  <StatusPill value={s.status} />
                </td>
                <td className="px-5 py-3 text-center">
                  <div className="flex justify-center items-center gap-1.5">
                    <button
                      onClick={() => handleViewDetails(s.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-foreground hover:bg-white/20 cursor-pointer border-0"
                      title="View Details"
                    >
                      <HiOutlineEye className="h-3.5 w-3.5" /> View
                    </button>
                    {s.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleApprove(s.id)}
                          className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition cursor-pointer animate-pulse border-0"
                          title="Approve School"
                        >
                          <HiCheck className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(s.id)}
                          className="inline-flex items-center gap-0.5 rounded-md bg-rose-500/15 px-2 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/25 transition cursor-pointer border-0"
                          title="Reject School"
                        >
                          <HiXMark className="h-3.5 w-3.5" /> Reject
                        </button>
                      </>
                    )}
                    {s.status === "APPROVED" && (
                      <button
                        onClick={() => handleLoginAs(s)}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-blue-300 hover:bg-primary/25 cursor-pointer border-0"
                      >
                        <HiOutlineArrowRightOnRectangle className="h-3.5 w-3.5" /> Login As
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* School Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4 bg-background">
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
                <HiXMark className="h-5 w-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <p className="text-xs text-muted-foreground">Retrieving Location, Inspections, Media submissions, and Rankings...</p>
              </div>
            ) : (
              <>
                {/* Tabs Selector */}
                <div className="flex border-b border-border bg-background/50 px-4 text-sm">
                  {[
                    { id: "profile", label: "General & Location" },
                    { id: "inspections", label: `Inspections (${schoolDetails?.InspectionRequests?.length || 0})` },
                    { id: "media", label: `Media Uploads (${schoolDetails?.MediaSubmissions?.length || 0})` },
                    { id: "rankings", label: "Rankings & History" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-4 py-3 font-medium transition-all border-b-2 cursor-pointer bg-transparent border-0 -mb-[1px] ${
                        activeTab === t.id
                          ? "border-primary text-primary font-semibold"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6 max-h-[60vh]">
                  {activeTab === "profile" && (
                    <div className="space-y-6">
                      {/* Performance & Rankings Summary */}
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Performance & Rankings Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div><div className="text-xs text-muted-foreground">Current Score</div><div className="text-lg font-bold text-foreground font-mono">{schoolDetails?.total_score || schoolDetails?.score || 0} pts</div></div>
                          <div><div className="text-xs text-muted-foreground">Current Rank</div><div className="text-lg font-bold text-amber-400">{schoolDetails?.RankTier?.tier_name || "No Rank"}</div></div>
                          <div><div className="text-xs text-muted-foreground">Global Rank</div><div className="text-lg font-bold text-foreground font-mono">{schoolDetails?.SchoolRankSnapshots?.[0]?.global_rank ? `#${schoolDetails.SchoolRankSnapshots[0].global_rank}` : "No Rank"}</div></div>
                          <div><div className="text-xs text-muted-foreground">State Rank</div><div className="text-lg font-bold text-foreground font-mono">{schoolDetails?.SchoolRankSnapshots?.[0]?.state_rank ? `#${schoolDetails.SchoolRankSnapshots[0].state_rank}` : "No Rank"}</div></div>
                          <div><div className="text-xs text-muted-foreground">District Rank</div><div className="text-lg font-bold text-foreground font-mono">{schoolDetails?.SchoolRankSnapshots?.[0]?.district_rank ? `#${schoolDetails.SchoolRankSnapshots[0].district_rank}` : "No Rank"}</div></div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">School & Contact Details</h4>
                          <div className="space-y-1.5 rounded-xl border border-border p-4 bg-muted/30 text-sm">
                            <div><span className="text-muted-foreground">School Name:</span> <span className="font-semibold text-foreground">{schoolDetails?.school_name || "School Name"}</span></div>
                            <div><span className="text-muted-foreground">School Code:</span> <span className="font-mono text-xs font-semibold text-foreground">{schoolDetails?.school_code || "Code"}</span></div>
                            <div><span className="text-muted-foreground">UDISE Code:</span> <span className="font-mono text-xs font-semibold text-foreground">{schoolDetails?.udise_code || "Udise Code"}</span></div>
                            <div><span className="text-muted-foreground">School Type:</span> <span className="text-foreground">{schoolDetails?.school_type || "Co-Ed"}</span></div>
                            <div><span className="text-muted-foreground">Affiliation Board:</span> <span className="text-foreground">{schoolDetails?.affiliation_board || "CBSE"}</span></div>
                            <div><span className="text-muted-foreground">Email Address:</span> <span className="text-foreground">{schoolDetails?.email || "No Email Provided"}</span></div>
                            <div><span className="text-muted-foreground">Mobile Contact:</span> <span className="text-foreground">{schoolDetails?.mobile || "No Contact Number"}</span></div>
                            {schoolDetails?.website && (
                              <div><span className="text-muted-foreground">Website:</span> <a href={schoolDetails.website} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{schoolDetails.website}</a></div>
                            )}
                            {schoolDetails?.website_url && (
                              <div><span className="text-muted-foreground">Website URL:</span> <a href={schoolDetails.website_url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{schoolDetails.website_url}</a></div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Location & Principal</h4>
                          <div className="space-y-1.5 rounded-xl border border-border p-4 bg-muted/30 text-sm">
                            <div><span className="text-muted-foreground">Principal Name:</span> <span className="font-semibold text-foreground">{schoolDetails?.principal_name || "Principal Name"}</span></div>
                            <div><span className="text-muted-foreground">Qualification:</span> <span className="text-foreground">{schoolDetails?.principal_qualification || "Qualification"}</span></div>
                            <div><span className="text-muted-foreground">Principal Email:</span> <span className="text-foreground">{schoolDetails?.principal_email || "Principal Email"}</span></div>
                            <div><span className="text-muted-foreground">Principal Mobile:</span> <span className="text-foreground">{schoolDetails?.principal_mobile || "Principal Mobile"}</span></div>
                            <div className="pt-2 border-t border-border mt-2">
                              <div><span className="text-muted-foreground">Address:</span> <span className="text-foreground">{schoolDetails?.address || "Address"}</span></div>
                              <div><span className="text-muted-foreground">Taluka/City:</span> <span className="text-foreground">{schoolDetails?.taluka || schoolDetails?.city || "City"}</span></div>
                              <div><span className="text-muted-foreground">District:</span> <span className="text-foreground">{schoolDetails?.District?.district_name || "District"}</span></div>
                              <div><span className="text-muted-foreground">State Coverage:</span> <span className="text-foreground">{schoolDetails?.District?.State?.state_name || "State"}</span></div>
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
                            <div><span className="text-muted-foreground">Library:</span> <div className="font-semibold text-foreground">{schoolDetails?.library_available ? "Available" : "Not Available"}</div></div>
                            <div><span className="text-muted-foreground">Playground:</span> <div className="font-semibold text-foreground">{schoolDetails?.playground_available ? "Available" : "Not Available"}</div></div>
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
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-semibold"
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
                  )}

                  {activeTab === "inspections" && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Inspection Logs & Reports</h4>
                      {(!schoolDetails?.InspectionRequests || schoolDetails.InspectionRequests.length === 0) ? (
                        <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                          No inspections recorded for this school.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {schoolDetails.InspectionRequests.map((req) => (
                            <div key={req.id} className="rounded-xl border border-border p-4 bg-muted/20 space-y-3">
                              <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                                <span className="font-mono font-bold text-foreground">Code: {req.request_code}</span>
                                <span className="px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                  {req.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                <div>Reason: <span className="text-foreground font-medium">{req.request_reason || "Routine Check"}</span></div>
                                <div>Requested At: <span className="text-foreground font-medium">{new Date(req.requested_at).toLocaleDateString()}</span></div>
                              </div>
                              {req.InspectionReport && (
                                <div className="mt-2 pt-2 border-t border-border/50 space-y-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-foreground">Inspection Report Details</span>
                                    <span className="text-emerald-400 font-bold text-sm">Rating: {req.InspectionReport.overall_rating}%</span>
                                  </div>
                                  <div><span className="font-semibold text-muted-foreground">Findings:</span> <p className="text-foreground inline pl-1">{req.InspectionReport.findings}</p></div>
                                  <div><span className="font-semibold text-muted-foreground">Strengths:</span> <p className="text-foreground inline pl-1">{req.InspectionReport.strengths}</p></div>
                                  <div><span className="font-semibold text-muted-foreground">Improvements:</span> <p className="text-foreground inline pl-1">{req.InspectionReport.improvement_areas}</p></div>
                                  <div><span className="font-semibold text-muted-foreground">Recommendations:</span> <p className="text-foreground inline pl-1">{req.InspectionReport.recommendations}</p></div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "media" && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Media Submissions</h4>
                      {(!schoolDetails?.MediaSubmissions || schoolDetails.MediaSubmissions.length === 0) ? (
                        <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                          No media uploads found for this school.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {schoolDetails.MediaSubmissions.map((sub) => (
                            <div key={sub.id} className="rounded-xl border border-border p-4 bg-muted/20 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono font-bold text-foreground">{sub.submission_code}</span>
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  sub.status === "PUBLISHED" || sub.status === "SUPER_APPROVED" 
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-amber-500/10 text-amber-400"
                                }`}>
                                  {sub.status}
                                </span>
                              </div>
                              <h5 className="text-sm font-semibold text-foreground">{sub.title}</h5>
                              <p className="text-xs text-muted-foreground line-clamp-2">{sub.description}</p>
                              <div className="text-[10px] text-muted-foreground pt-1">
                                Submitted on: {new Date(sub.submitted_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "rankings" && (() => {
                    const latestAudit = schoolDetails?.SchoolInspectionAudits && schoolDetails.SchoolInspectionAudits.length > 0
                      ? [...schoolDetails.SchoolInspectionAudits].sort((a, b) => b.id - a.id)[0]
                      : null;
                    const inspectionDate = latestAudit?.inspection_date
                      ? new Date(latestAudit.inspection_date).toLocaleDateString()
                      : "N/A";
                    const assignedBy = latestAudit?.User
                      ? `${latestAudit.User.first_name} ${latestAudit.User.last_name}`
                      : "N/A";

                    return (
                      <div className="space-y-6">
                        {/* Super Admin Score Management Panel */}
                        <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-4">
                          <div className="flex items-center justify-between border-b border-border pb-3">
                            <div>
                              <h4 className="text-sm font-bold text-foreground">Super Admin Score Management Panel</h4>
                              <p className="text-xs text-muted-foreground">Override academic, achievement, media, and participation scores anytime.</p>
                            </div>
                            {!isEditingScores ? (
                              <button
                                onClick={handleStartEditScores}
                                className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25 cursor-pointer border-0"
                              >
                                Edit Scores
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleSaveScores}
                                  disabled={savingScores}
                                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 cursor-pointer border-0 disabled:opacity-50"
                                >
                                  {savingScores ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                  onClick={() => setIsEditingScores(false)}
                                  className="rounded-lg bg-slate-500/10 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-slate-500/20 cursor-pointer border-0"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>

                          {isEditingScores ? (
                            <div className="space-y-4 pt-1">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">Academic Score (0 - 300)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="300"
                                    value={editScores.academic_score}
                                    onChange={(e) => setEditScores({ ...editScores, academic_score: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">Achievement Score (0 - 300)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="300"
                                    value={editScores.achievement_score}
                                    onChange={(e) => setEditScores({ ...editScores, achievement_score: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">Media Score (0 - 300)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="300"
                                    value={editScores.media_score}
                                    onChange={(e) => setEditScores({ ...editScores, media_score: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">Participation Score (0 - 100)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editScores.participation_score}
                                    onChange={(e) => setEditScores({ ...editScores, participation_score: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                                  />
                                </div>
                              </div>
                              <div className="pt-2 border-t border-border flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-semibold">Estimated Total Score:</span>
                                <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
                                  {(parseInt(editScores.academic_score || 0, 10) +
                                    parseInt(editScores.achievement_score || 0, 10) +
                                    parseInt(editScores.media_score || 0, 10) +
                                    parseInt(editScores.participation_score || 0, 10))} / 1000
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 text-sm">
                              <div><div className="text-xs text-muted-foreground">Academic Score</div><div className="text-base font-bold text-foreground font-mono">{schoolDetails?.academic_score || 0} / 300</div></div>
                              <div><div className="text-xs text-muted-foreground">Achievement Score</div><div className="text-base font-bold text-foreground font-mono">{schoolDetails?.achievement_score || 0} / 300</div></div>
                              <div><div className="text-xs text-muted-foreground">Media Score</div><div className="text-base font-bold text-foreground font-mono">{schoolDetails?.media_score || 0} / 300</div></div>
                              <div><div className="text-xs text-muted-foreground">Participation Score</div><div className="text-base font-bold text-foreground font-mono">{schoolDetails?.participation_score || 0} / 100</div></div>
                              <div><div className="text-xs text-muted-foreground font-bold">Total Score</div><div className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">{schoolDetails?.total_score || schoolDetails?.score || 0} / 1000</div></div>
                              <div><div className="text-xs text-muted-foreground font-bold">Current Rank</div><div className="text-base font-bold text-amber-400">{schoolDetails?.RankTier?.tier_name || "No Rank"}</div></div>
                              <div><div className="text-xs text-muted-foreground font-bold">Inspection Date</div><div className="text-base font-semibold text-foreground font-mono">{inspectionDate}</div></div>
                              <div><div className="text-xs text-muted-foreground font-bold">Assigned By</div><div className="text-base font-semibold text-foreground">{assignedBy}</div></div>
                            </div>
                          )}
                        </div>

                        {/* Current Ranking Snapshot */}
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Current Ranking snapshot</h4>
                          {(!schoolDetails?.SchoolRankSnapshots || schoolDetails.SchoolRankSnapshots.length === 0) ? (
                            <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-muted/10">
                              No ranking snapshot available for the current active period.
                            </div>
                          ) : (
                            <div className="rounded-xl border border-border p-4 bg-amber-500/5 border-amber-500/20 text-sm">
                              {schoolDetails.SchoolRankSnapshots.map((snap) => (
                                <div key={snap.id} className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                  <div><div className="text-xs text-muted-foreground font-semibold">Rank Tier</div><div className="text-lg font-bold text-amber-400">{snap.RankTier?.tier_name || "No Rank"}</div></div>
                                  <div><div className="text-xs text-muted-foreground font-semibold">Total Score</div><div className="text-lg font-bold text-foreground font-mono">{snap.total_score} pts</div></div>
                                  <div><div className="text-xs text-muted-foreground font-semibold">Global Rank</div><div className="text-lg font-bold text-foreground font-mono">#{snap.global_rank || "No Rank"}</div></div>
                                  <div><div className="text-xs text-muted-foreground font-semibold">State Rank</div><div className="text-lg font-bold text-foreground font-mono">#{snap.state_rank || "No Rank"}</div></div>
                                  <div><div className="text-xs text-muted-foreground font-semibold">District Rank</div><div className="text-lg font-bold text-foreground font-mono">#{snap.district_rank || "No Rank"}</div></div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Rank History */}
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Historical Rankings</h4>
                          {(!schoolDetails?.SchoolRankHistories || schoolDetails.SchoolRankHistories.length === 0) ? (
                            <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-muted/10">
                              No ranking history found in database.
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-border bg-muted/10">
                              <table className="w-full text-xs text-left">
                                <thead>
                                  <tr className="bg-background text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                                    <th className="px-4 py-2.5">Date</th>
                                    <th className="px-4 py-2.5">Rank Tier</th>
                                    <th className="px-4 py-2.5">Global Rank</th>
                                    <th className="px-4 py-2.5">State Rank</th>
                                    <th className="px-4 py-2.5">District Rank</th>
                                    <th className="px-4 py-2.5">Total Score</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {schoolDetails.SchoolRankHistories.map((hist) => (
                                    <tr key={hist.id} className="border-t border-border hover:bg-white/5">
                                      <td className="px-4 py-2 text-muted-foreground">{new Date(hist.calculated_at).toLocaleDateString()}</td>
                                      <td className="px-4 py-2 font-bold text-foreground">{hist.RankTier?.tier_name || "No Rank"}</td>
                                      <td className="px-4 py-2 font-mono">#{hist.global_rank || "No Rank"}</td>
                                      <td className="px-4 py-2 font-mono">#{hist.state_rank || "No Rank"}</td>
                                      <td className="px-4 py-2 font-mono">#{hist.district_rank || "No Rank"}</td>
                                      <td className="px-4 py-2 font-mono font-bold text-blue-600 dark:text-blue-400">{hist.total_score} pts</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4 bg-background flex justify-end">
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
        </div>
      )}
    </Card>
  );
}
