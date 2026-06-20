import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getSchools } from "../../api/schools";
import { getActivitiesBySchool } from "../../api/activities";
import { getSchoolAnalytics } from "../../api/analytics";
import { getSchoolRankings } from "../../api/rankings";
import { toast } from "sonner";
import { Users, BookOpen, Award, Camera, MapPin, Phone, Mail, Edit, Trophy } from "lucide-react";

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

      if (schoolsRes.success && Array.isArray(schoolsRes.data)) {
        const currentSchool = schoolsRes.data.find(s => s.id === schoolId) || schoolsRes.data[0];
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

  const overallRank = rankingData?.current?.RankTier?.tier_name || "Silver";
  const stateRank = rankingData?.current?.state_rank ? `Position #${rankingData.current.state_rank} in State` : "Not Ranked";

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
              { label: "Academic Score", value: Math.round(schoolData?.scores?.academic || 0), color: "#4f7fff" },
              { label: "Achievement Score", value: Math.round(schoolData?.scores?.achievements || 0), color: "#34d399" },
              { label: "Media Uploads", value: Math.round(schoolData?.scores?.media || 0), color: "#8b5cf6" },
            ].map((p, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-xs mb-1" style={{ color: textMuted }}>
                  <span>{p.label}</span><span style={{ color: p.color }}>{p.value}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${p.value}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}88)` }} />
                </div>
              </div>
            ))}
            {rankingData?.current ? (
              <div className="mt-4 p-4 rounded-xl space-y-2 bg-amber-500/10 border border-amber-500/20 text-left">
                <div className="flex items-center gap-2 text-amber-500 font-bold">
                  <Trophy size={20} />
                  <span>Rank: {rankingData.current.RankTier?.tier_name || "Bronze"}</span>
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
                  <div className="text-sm font-bold" style={{ color: textPrimary }}>Not Ranked</div>
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
    </div>
  );
}
