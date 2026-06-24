import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getSchools, getStates, getDistricts, updateSchool } from "../../api/schools";
import { getActivitiesBySchool } from "../../api/activities";
import { getSchoolAnalytics } from "../../api/analytics";
import { getSchoolRankings } from "../../api/rankings";
import { toast } from "sonner";
import { Users, BookOpen, Award, Camera, MapPin, Phone, Mail, Edit, Trophy, X } from "lucide-react";

const statusColor = { 
  Approved: "#34d399", 
  APPROVED: "#34d399",
  Pending: "#f59e0b", 
  PENDING: "#f59e0b",
  "Under Review": "#4f7fff", 
  UNDER_REVIEW: "#4f7fff",
  "Sent Back": "#ef4444",
  REJECTED: "#ef4444" 
};

export default function SchoolAdminSchools({ darkMode }) {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [activities, setActivities] = useState([]);
  const [schoolData, setSchoolData] = useState(null);
  const [rankingData, setRankingData] = useState(null);

  const schoolId = user?.scope?.schoolId || 1;

  const [showEditModal, setShowEditModal] = useState(false);
  const [states, setStates] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [formValues, setFormValues] = useState({
    school_name: "",
    school_code: "",
    udise_code: "",
    school_type: "",
    affiliation_board: "",
    district_id: "",
    city: "",
    address: "",
    pin_code: "",
    principal_name: "",
    principal_email: "",
    principal_mobile: "",
    principal_qualification: "",
    student_count: 0,
    boys_count: 0,
    girls_count: 0,
    teacher_count: 0,
    male_teachers_count: 0,
    female_teachers_count: 0,
    non_teaching_staff_count: 0,
    classrooms_count: 0,
    labs_count: 0,
    computer_labs_count: 0,
    library_available: false,
    playground_available: false,
    smart_classrooms_count: 0,
    facebook_url: "",
    instagram_url: "",
    youtube_url: "",
    website_url: ""
  });

  const handleOpenEditModal = async (schoolDataOverride = null) => {
    try {
      const targetSchool = schoolDataOverride || school;
      const [statesRes, districtsRes] = await Promise.all([
        getStates(),
        getDistricts()
      ]);
      if (statesRes.success) setStates(statesRes.data || []);
      if (districtsRes.success) setDistrictsList(districtsRes.data || []);
      
      // Pre-fill form values
      setSelectedStateId(targetSchool?.District?.state_id || "");
      setFormValues({
        school_name: targetSchool?.school_name || "",
        school_code: targetSchool?.school_code || "",
        udise_code: targetSchool?.udise_code || "",
        school_type: targetSchool?.school_type || "",
        affiliation_board: targetSchool?.affiliation_board || "",
        district_id: targetSchool?.district_id || "",
        city: targetSchool?.city || "",
        address: targetSchool?.address || "",
        pin_code: targetSchool?.pin_code || "",
        principal_name: targetSchool?.principal_name || "",
        principal_email: targetSchool?.principal_email || targetSchool?.email || "",
        principal_mobile: targetSchool?.principal_mobile || targetSchool?.mobile || "",
        principal_qualification: targetSchool?.principal_qualification || "",
        student_count: targetSchool?.student_count || 0,
        boys_count: targetSchool?.boys_count || 0,
        girls_count: targetSchool?.girls_count || 0,
        teacher_count: targetSchool?.teacher_count || 0,
        male_teachers_count: targetSchool?.male_teachers_count || 0,
        female_teachers_count: targetSchool?.female_teachers_count || 0,
        non_teaching_staff_count: targetSchool?.non_teaching_staff_count || 0,
        classrooms_count: targetSchool?.classrooms_count || 0,
        labs_count: targetSchool?.labs_count || 0,
        computer_labs_count: targetSchool?.computer_labs_count || 0,
        library_available: !!targetSchool?.library_available,
        playground_available: !!targetSchool?.playground_available,
        smart_classrooms_count: targetSchool?.smart_classrooms_count || 0,
        facebook_url: targetSchool?.facebook_url || "",
        instagram_url: targetSchool?.instagram_url || "",
        youtube_url: targetSchool?.youtube_url || "",
        website_url: targetSchool?.website_url || ""
      });
      setShowEditModal(true);
    } catch (err) {
      toast.error("Failed to load options: " + err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.district_id) {
      toast.error("Please select a District");
      return;
    }

    const fbRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+$/i;
    const igRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/i;
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i;
    const webRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i;

    const isRanked = school?.inspection_status === 'COMPLETED' && school?.tier_id !== null;
    if (isRanked) {
      if (!formValues.facebook_url) {
        toast.error("Facebook URL is required after ranking");
        return;
      }
      if (!formValues.instagram_url) {
        toast.error("Instagram URL is required after ranking");
        return;
      }
      if (!formValues.youtube_url) {
        toast.error("YouTube URL is required after ranking");
        return;
      }
    }

    if (formValues.facebook_url && !fbRegex.test(formValues.facebook_url)) {
      toast.error("Invalid Facebook Page URL (must contain facebook.com or fb.com)");
      return;
    }
    if (formValues.instagram_url && !igRegex.test(formValues.instagram_url)) {
      toast.error("Invalid Instagram Profile URL (must contain instagram.com)");
      return;
    }
    if (formValues.youtube_url && !ytRegex.test(formValues.youtube_url)) {
      toast.error("Invalid YouTube Channel URL (must contain youtube.com or youtu.be)");
      return;
    }
    if (formValues.website_url && !webRegex.test(formValues.website_url)) {
      toast.error("Invalid Website URL format");
      return;
    }

    try {
      const payload = {
        ...formValues,
        district_id: parseInt(formValues.district_id, 10),
        student_count: parseInt(formValues.student_count || 0, 10),
        boys_count: parseInt(formValues.boys_count || 0, 10),
        girls_count: parseInt(formValues.girls_count || 0, 10),
        teacher_count: parseInt(formValues.teacher_count || 0, 10),
        male_teachers_count: parseInt(formValues.male_teachers_count || 0, 10),
        female_teachers_count: parseInt(formValues.female_teachers_count || 0, 10),
        non_teaching_staff_count: parseInt(formValues.non_teaching_staff_count || 0, 10),
        classrooms_count: parseInt(formValues.classrooms_count || 0, 10),
        labs_count: parseInt(formValues.labs_count || 0, 10),
        computer_labs_count: parseInt(formValues.computer_labs_count || 0, 10),
        smart_classrooms_count: parseInt(formValues.smart_classrooms_count || 0, 10),
        library_available: formValues.library_available ? 1 : 0,
        playground_available: formValues.playground_available ? 1 : 0
      };

      const res = await updateSchool(schoolId, payload);
      if (res.success) {
        toast.success("School profile updated successfully!");
        setShowEditModal(false);
        loadData();
      } else {
        toast.error(res.message || "Failed to update school profile");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "An error occurred");
    }
  };

  const filteredDistricts = districtsList.filter(d => String(d.state_id) === String(selectedStateId));

  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";

  const loadData = async () => {
    try {
      setLoading(true);
      const [schoolsRes, activitiesRes, analyticsRes, rankingRes] = await Promise.all([
        getSchools(),
        getActivitiesBySchool(schoolId),
        getSchoolAnalytics(schoolId),
        getSchoolRankings(schoolId)
      ]);

      let currentSchool = null;
      if (schoolsRes.success && Array.isArray(schoolsRes.data)) {
        currentSchool = schoolsRes.data.find(s => s.id === schoolId) || schoolsRes.data[0];
        setSchool(currentSchool);
      }
      if (activitiesRes.success && Array.isArray(activitiesRes.data)) {
        setActivities(activitiesRes.data);
      }
      if (analyticsRes.success) {
        setSchoolData(analyticsRes.data);
      }
      if (rankingRes.success) {
        setRankingData(rankingRes.data);
      }

      // Auto Data Validation Check
      if (currentSchool) {
        const isProfileIncomplete =
          !currentSchool.udise_code ||
          !currentSchool.principal_name ||
          !currentSchool.principal_email ||
          !currentSchool.principal_mobile ||
          !currentSchool.principal_qualification ||
          !currentSchool.district_id ||
          !currentSchool.city ||
          !currentSchool.address ||
          !currentSchool.pin_code ||
          Number(currentSchool.student_count || 0) === 0 ||
          Number(currentSchool.boys_count || 0) === 0 ||
          Number(currentSchool.girls_count || 0) === 0 ||
          Number(currentSchool.teacher_count || 0) === 0 ||
          Number(currentSchool.classrooms_count || 0) === 0;

        if (isProfileIncomplete) {
          toast.warning("Your school profile is incomplete! Please complete your school profile details.", {
            id: "incomplete-profile-warning",
            duration: 5000
          });
          handleOpenEditModal(currentSchool);
        }
      }
    } catch (err) {
      toast.error("Failed to load school profile data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId]);

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading School Details...</p>
        </div>
      </div>
    );
  }

  const overallRank = rankingData?.current?.RankTier?.tier_name || "No Rank";
  const stateRank = rankingData?.current?.state_rank ? `Position #${rankingData.current.state_rank} in State` : "No Rank";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: school?.student_count?.toLocaleString() || "0", icon: Users, color: "#4f7fff", change: "Updated live" },
          { label: "Total Teachers", value: school?.teacher_count?.toLocaleString() || "0", icon: BookOpen, color: "#34d399", change: "Updated live" },
          { label: "Achievements Score", value: `${Math.round(schoolData?.scores?.achievements || 0)}%`, icon: Award, color: "#f59e0b", change: "Performance index" },
          { label: "Uploaded Activities", value: activities.length.toString(), icon: Camera, color: "#8b5cf6", change: "Total events" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}18` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div className="font-bold" style={{ color: textPrimary, fontSize: "1.5rem", lineHeight: 1 }}>{s.value}</div>
            <div className="text-sm mt-1" style={{ color: textMuted }}>{s.label}</div>
            <div className="text-xs mt-1" style={{ color: "#34d399" }}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* School Info */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: textPrimary }}>School Information</h3>
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg cursor-pointer hover:opacity-90 border-0"
            >
              <Edit size={14} />
              <span>Edit School Profile</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden"
              style={{ background: "linear-gradient(135deg, #4f7fff22, #8b5cf622)", border: cardBorder }}>
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={32} style={{ color: "#4f7fff" }} />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ color: textPrimary }}>{school?.school_name || "Unknown School"}</h2>
              <p className="text-sm mt-1" style={{ color: textMuted }}>
                School Code: {school?.school_code} · UDISE: {school?.udise_code || "N/A"} · Principal: {school?.principal_name || "N/A"}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm" style={{ color: textMuted }}>
                <span className="flex items-center gap-1"><MapPin size={12} /> {school?.address || "No Address Provided"}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm" style={{ color: textMuted }}>
                <span className="flex items-center gap-1"><Phone size={12} /> {school?.mobile || school?.phone || "N/A"}</span>
                <span className="flex items-center gap-1"><Mail size={12} /> {school?.email || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-4" style={{ borderTop: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
            <div><div className="text-xs" style={{ color: textMuted }}>State Scope</div><div className="text-sm font-medium" style={{ color: textPrimary }}>{school?.District?.State?.state_name || "N/A"}</div></div>
            <div><div className="text-xs" style={{ color: textMuted }}>District</div><div className="text-sm font-medium" style={{ color: textPrimary }}>{school?.District?.district_name || "N/A"}</div></div>
            <div><div className="text-xs" style={{ color: textMuted }}>Principal Email</div><div className="text-sm font-medium" style={{ color: textPrimary }}>{school?.email || "N/A"}</div></div>
            <div><div className="text-xs" style={{ color: textMuted }}>UDISE Registration</div><div className="text-sm font-medium" style={{ color: textPrimary }}>{school?.udise_code || "N/A"}</div></div>
          </div>
        </div>

        {/* Performance */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <h3 className="font-semibold mb-4" style={{ color: textPrimary }}>Performance Summary</h3>
            {[
              { label: "Academic Score", value: school?.academic_score || 0, max: 300, color: "#4f7fff" },
              { label: "Achievement Score", value: school?.achievement_score || 0, max: 300, color: "#34d399" },
              { label: "Media Score", value: school?.media_score || 0, max: 300, color: "#8b5cf6" },
              { label: "Participation Score", value: school?.participation_score || 0, max: 100, color: "#f59e0b" },
            ].map((p, i) => {
              const percentage = Math.min(100, Math.max(0, Math.round((p.value / p.max) * 100)));
              return (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: textMuted }}>
                    <span>{p.label}</span><span style={{ color: p.color }}>{p.value} / {p.max}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}88)` }} />
                  </div>
                </div>
              );
            })}
            {rankingData?.current ? (
              <div className="mt-4 p-4 rounded-xl space-y-2 bg-amber-500/10 border border-amber-500/20 text-left">
                <div className="flex items-center gap-2 text-amber-500 font-bold">
                  <Trophy size={20} />
                  <span>Rank: {rankingData.current.RankTier?.tier_name || "No Rank"}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pt-2 border-t border-amber-500/10" style={{ color: textPrimary }}>
                  <div><span style={{ color: textMuted }}>Total Score:</span> <span className="font-bold">{rankingData.current.total_score || 0} pts</span></div>
                  <div><span style={{ color: textMuted }}>Global Rank:</span> <span className="font-bold">#{rankingData.current.global_rank || "N/A"}</span></div>
                  <div><span style={{ color: textMuted }}>State Rank:</span> <span className="font-bold">#{rankingData.current.state_rank || "N/A"}</span></div>
                  <div><span style={{ color: textMuted }}>District Rank:</span> <span className="font-bold">#{rankingData.current.district_rank || "N/A"}</span></div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl flex items-center gap-3 bg-slate-500/10 border border-slate-500/20 text-left">
                <Trophy size={20} style={{ color: textMuted }} />
                <div>
                  <div className="text-sm font-bold" style={{ color: textPrimary }}>No Rank</div>
                  <p className="text-xs" style={{ color: textMuted }}>No performance snapshots available for this school in the current period.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities table */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <h3 className="font-semibold mb-4" style={{ color: textPrimary }}>Recent Activities</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                {["Activity Title", "Type", "Date", "Submitted By", "Status"].map((h) => (
                  <th key={h} className="text-left pb-3 pr-4 text-xs font-medium" style={{ color: textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.slice(0, 8).map((a, i) => (
                <tr key={i} style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.03)" }}>
                  <td className="py-3 pr-4 font-medium" style={{ color: textPrimary }}>{a.title}</td>
                  <td className="py-3 pr-4" style={{ color: textMuted }}>{a.ActivityCategory?.category_name || "General"}</td>
                  <td className="py-3 pr-4" style={{ color: textMuted }}>{new Date(a.date).toLocaleDateString()}</td>
                  <td className="py-3 pr-4" style={{ color: textMuted }}>{school?.principal_name || "School Admin"}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ 
                        background: `${statusColor[a.status] || "#6b7280"}18`, 
                        color: statusColor[a.status] || "#6b7280" 
                      }}>{a.status || "ACTIVE"}</span>
                  </td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs" style={{ color: textMuted }}>
                    No recent activities recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit School Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-4xl p-6 rounded-2xl space-y-5 max-h-[90vh] overflow-y-auto scrollbar-thin text-foreground"
            style={{
              background: darkMode ? "var(--surface, #121829)" : "#ffffff",
              border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)"
            }}
          >
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold">Edit School Profile</h3>
                <p className="text-xs text-muted-foreground">Modify school information, principal details, statistics, infrastructure, and social links.</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="border-0 bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Category: School Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4f7fff]">School Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>School Name</label>
                    <input
                      type="text"
                      required
                      value={formValues.school_name}
                      onChange={e => setFormValues(prev => ({ ...prev, school_name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>School Code</label>
                    <input
                      type="text"
                      required
                      value={formValues.school_code}
                      onChange={e => setFormValues(prev => ({ ...prev, school_code: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>UDISE Code</label>
                    <input
                      type="text"
                      required
                      value={formValues.udise_code}
                      onChange={e => setFormValues(prev => ({ ...prev, udise_code: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>School Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Co-Ed, Girls, Boys"
                      value={formValues.school_type}
                      onChange={e => setFormValues(prev => ({ ...prev, school_type: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Board</label>
                    <input
                      type="text"
                      placeholder="e.g. CBSE, ICSE, State Board"
                      value={formValues.affiliation_board}
                      onChange={e => setFormValues(prev => ({ ...prev, affiliation_board: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Category: Location */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4f7fff]">Location Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>State</label>
                    <select
                      value={selectedStateId}
                      onChange={e => {
                        setSelectedStateId(e.target.value);
                        setFormValues(prev => ({ ...prev, district_id: "" }));
                      }}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    >
                      <option value="">Select State</option>
                      {states.map(s => (
                        <option key={s.id} value={s.id}>{s.state_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>District</label>
                    <select
                      value={formValues.district_id}
                      onChange={e => setFormValues(prev => ({ ...prev, district_id: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                      disabled={!selectedStateId}
                    >
                      <option value="">Select District</option>
                      {filteredDistricts.map(d => (
                        <option key={d.id} value={d.id}>{d.district_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>City</label>
                    <input
                      type="text"
                      value={formValues.city}
                      onChange={e => setFormValues(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Address</label>
                    <input
                      type="text"
                      value={formValues.address}
                      onChange={e => setFormValues(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>PIN Code</label>
                    <input
                      type="text"
                      value={formValues.pin_code}
                      onChange={e => setFormValues(prev => ({ ...prev, pin_code: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Category: Principal Information */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4f7fff]">Principal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Principal Name</label>
                    <input
                      type="text"
                      value={formValues.principal_name}
                      onChange={e => setFormValues(prev => ({ ...prev, principal_name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Principal Email</label>
                    <input
                      type="email"
                      value={formValues.principal_email}
                      onChange={e => setFormValues(prev => ({ ...prev, principal_email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Principal Mobile</label>
                    <input
                      type="text"
                      value={formValues.principal_mobile}
                      onChange={e => setFormValues(prev => ({ ...prev, principal_mobile: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Principal Qualification</label>
                    <input
                      type="text"
                      value={formValues.principal_qualification}
                      onChange={e => setFormValues(prev => ({ ...prev, principal_qualification: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Category: Statistics */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4f7fff]">Strength Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Total Students</label>
                    <input
                      type="number"
                      value={formValues.student_count}
                      onChange={e => setFormValues(prev => ({ ...prev, student_count: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Boys Count</label>
                    <input
                      type="number"
                      value={formValues.boys_count}
                      onChange={e => setFormValues(prev => ({ ...prev, boys_count: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Girls Count</label>
                    <input
                      type="number"
                      value={formValues.girls_count}
                      onChange={e => setFormValues(prev => ({ ...prev, girls_count: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Total Teachers</label>
                    <input
                      type="number"
                      value={formValues.teacher_count}
                      onChange={e => setFormValues(prev => ({ ...prev, teacher_count: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Male Teachers</label>
                    <input
                      type="number"
                      value={formValues.male_teachers_count}
                      onChange={e => setFormValues(prev => ({ ...prev, male_teachers_count: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Female Teachers</label>
                    <input
                      type="number"
                      value={formValues.female_teachers_count}
                      onChange={e => setFormValues(prev => ({ ...prev, female_teachers_count: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Non-Teaching Staff</label>
                    <input
                      type="number"
                      value={formValues.non_teaching_staff_count}
                      onChange={e => setFormValues(prev => ({ ...prev, non_teaching_staff_count: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Category: Infrastructure */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4f7fff]">Infrastructure Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Classrooms</label>
                    <input
                      type="number"
                      value={formValues.classrooms_count}
                      onChange={e => setFormValues(prev => ({ ...prev, classrooms_count: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Labs</label>
                    <input
                      type="number"
                      value={formValues.labs_count}
                      onChange={e => setFormValues(prev => ({ ...prev, labs_count: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Computer Labs</label>
                    <input
                      type="number"
                      value={formValues.computer_labs_count}
                      onChange={e => setFormValues(prev => ({ ...prev, computer_labs_count: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Smart Classrooms</label>
                    <input
                      type="number"
                      value={formValues.smart_classrooms_count}
                      onChange={e => setFormValues(prev => ({ ...prev, smart_classrooms_count: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="library_available"
                      checked={formValues.library_available}
                      onChange={e => setFormValues(prev => ({ ...prev, library_available: e.target.checked }))}
                      className="h-4 w-4 rounded border-border bg-background cursor-pointer"
                    />
                    <label htmlFor="library_available" className="text-xs font-semibold cursor-pointer select-none" style={{ color: textPrimary }}>Library Available</label>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="playground_available"
                      checked={formValues.playground_available}
                      onChange={e => setFormValues(prev => ({ ...prev, playground_available: e.target.checked }))}
                      className="h-4 w-4 rounded border-border bg-background cursor-pointer"
                    />
                    <label htmlFor="playground_available" className="text-xs font-semibold cursor-pointer select-none" style={{ color: textPrimary }}>Playground Available</label>
                  </div>
                </div>
              </div>

              {/* Category: Social Media */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4f7fff]">Social Media Handles & Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Facebook URL</label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/yourschool"
                      value={formValues.facebook_url}
                      onChange={e => setFormValues(prev => ({ ...prev, facebook_url: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Instagram URL</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/yourschool"
                      value={formValues.instagram_url}
                      onChange={e => setFormValues(prev => ({ ...prev, instagram_url: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>YouTube URL</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/c/yourschool"
                      value={formValues.youtube_url}
                      onChange={e => setFormValues(prev => ({ ...prev, youtube_url: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: textMuted }}>Website URL</label>
                    <input
                      type="text"
                      placeholder="https://yourschool.edu.in"
                      value={formValues.website_url}
                      onChange={e => setFormValues(prev => ({ ...prev, website_url: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm border bg-background text-foreground focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-2 justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-muted-foreground bg-transparent hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer border-none bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
