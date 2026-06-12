import { Users, BookOpen, Award, Camera, MapPin, Phone, Mail, Edit, Trophy } from "lucide-react";

const activities = [
  { title: "Annual Sports Day 2024", type: "Activity", date: "10 May 2024", status: "Approved", submittedBy: "John Smith" },
  { title: "Science Fair Exhibition", type: "Activity", date: "22 May 2024", status: "Pending", submittedBy: "John Smith" },
  { title: "International Yoga Day", type: "Activity", date: "21 Jun 2024", status: "Approved", submittedBy: "John Smith" },
  { title: "Tree Plantation Drive", type: "Activity", date: "05 Jun 2024", status: "Under Review", submittedBy: "John Smith" },
];

const statusColor = { Approved: "#34d399", Pending: "#f59e0b", "Under Review": "#4f7fff", "Sent Back": "#ef4444" };

export default function SchoolAdminSchools({ darkMode }) {
  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "1,250", icon: Users, color: "#4f7fff", change: "+40 from last month" },
          { label: "Total Teachers", value: "85", icon: BookOpen, color: "#34d399", change: "+3 from last month" },
          { label: "Achievements", value: "32", icon: Award, color: "#f59e0b", change: "+5 from last year" },
          { label: "Uploaded Activities", value: "128", icon: Camera, color: "#8b5cf6", change: "+12 from last month" },
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
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: "rgba(79,127,255,0.15)", color: "#4f7fff" }}>
              <Edit size={13} /> Edit Profile
            </button>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden"
              style={{ background: "linear-gradient(135deg, #4f7fff22, #8b5cf622)", border: cardBorder }}>
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={32} style={{ color: "#4f7fff" }} />
              </div>
            </div>
            <div>
              <h2 className="font-bold" style={{ color: textPrimary }}>ABC International School</h2>
              <p className="text-sm mt-1" style={{ color: textMuted }}>CBSE · Est. 2009 · Principal: John Smith</p>
              <div className="flex gap-4 mt-2 text-sm" style={{ color: textMuted }}>
                <span className="flex items-center gap-1"><MapPin size={12} /> 123 Education Street, Gujarat - 380001</span>
              </div>
              <div className="flex gap-3 mt-2 text-sm" style={{ color: textMuted }}>
                <span className="flex items-center gap-1"><Phone size={12} /> +91-79614-42250</span>
                <span className="flex items-center gap-1"><Mail size={12} /> admin@gdschool.in</span>
              </div>
              <div className="mt-2 text-xs" style={{ color: textMuted }}>Affiliation No: GDS-2024-ABN-4291</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-4" style={{ borderTop: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
            <div><div className="text-xs" style={{ color: textMuted }}>Board</div><div className="text-sm font-medium" style={{ color: textPrimary }}>CBSE</div></div>
            <div><div className="text-xs" style={{ color: textMuted }}>Established</div><div className="text-sm font-medium" style={{ color: textPrimary }}>2009</div></div>
            <div><div className="text-xs" style={{ color: textMuted }}>Classes</div><div className="text-sm font-medium" style={{ color: textPrimary }}>LKG – XII</div></div>
            <div><div className="text-xs" style={{ color: textMuted }}>Affiliation</div><div className="text-sm font-medium" style={{ color: textPrimary }}>GDS-2024-ABN-4291</div></div>
          </div>
        </div>

        {/* Performance */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <h3 className="font-semibold mb-4" style={{ color: textPrimary }}>Performance Summary</h3>
            {[
              { label: "Activity Score", value: 85, color: "#4f7fff" },
              { label: "Achievement Score", value: 78, color: "#34d399" },
              { label: "Media Uploads", value: 92, color: "#8b5cf6" },
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
            <div className="mt-4 p-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <Trophy size={20} style={{ color: "#f59e0b" }} />
              <div>
                <div className="text-sm font-bold" style={{ color: "#f59e0b" }}>Overall Rank: Gold</div>
                <div className="text-xs" style={{ color: textMuted }}>Position #12 nationally</div>
              </div>
            </div>
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
                {["Activity Title", "Type", "Date", "Submitted By", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left pb-3 pr-4 text-xs font-medium" style={{ color: textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.map((a, i) => (
                <tr key={i} style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.03)" }}>
                  <td className="py-3 pr-4 font-medium" style={{ color: textPrimary }}>{a.title}</td>
                  <td className="py-3 pr-4" style={{ color: textMuted }}>{a.type}</td>
                  <td className="py-3 pr-4" style={{ color: textMuted }}>{a.date}</td>
                  <td className="py-3 pr-4" style={{ color: textMuted }}>{a.submittedBy}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: `${statusColor[a.status]}18`, color: statusColor[a.status] }}>{a.status}</span>
                  </td>
                  <td className="py-3">
                    <button className="text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-70" style={{ color: "#4f7fff" }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
