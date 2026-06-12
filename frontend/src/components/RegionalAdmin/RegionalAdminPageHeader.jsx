import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  School,
  Video,
  Map,
  Trophy,
  ClipboardList,
  Settings,
  ChevronRight,
  Plus
} from "lucide-react";

const iconsMap = {
  dashboard: LayoutDashboard,
  schools: School,
  "add-school": School,
  videos: Video,
  districts: Map,
  "add-district": Map,
  rankings: Trophy,
  inspections: ClipboardList,
  settings: Settings,
};

const colorsMap = {
  dashboard: "#3B82F6",
  schools: "#6366F1",
  "add-school": "#6366F1",
  videos: "#8B5CF6",
  districts: "#10B981",
  "add-district": "#10B981",
  rankings: "#F59E0B",
  inspections: "#EF4444",
  settings: "#64748B",
};

const breadcrumbsMap = {
  dashboard: [{ label: "Dashboard", to: null }],
  schools: [
    { label: "Dashboard", to: "/regional-admin" },
    { label: "Schools", to: null },
  ],
  "add-school": [
    { label: "Dashboard", to: "/regional-admin" },
    { label: "Schools", to: "/regional-admin/schools" },
    { label: "Add School", to: null },
  ],
  videos: [
    { label: "Dashboard", to: "/regional-admin" },
    { label: "Videos & Media", to: null },
  ],
  districts: [
    { label: "Dashboard", to: "/regional-admin" },
    { label: "Districts", to: null },
  ],
  "add-district": [
    { label: "Dashboard", to: "/regional-admin" },
    { label: "Districts", to: "/regional-admin/districts" },
    { label: "Add District", to: null },
  ],
  rankings: [
    { label: "Dashboard", to: "/regional-admin" },
    { label: "Rankings", to: null },
  ],
  inspections: [
    { label: "Dashboard", to: "/regional-admin" },
    { label: "Inspection Reports", to: null },
  ],
  settings: [
    { label: "Dashboard", to: "/regional-admin" },
    { label: "Settings", to: null },
  ],
};

export default function RegionalAdminPageHeader({ title, subtitle, page }) {
  const navigate = useNavigate();
  
  const IconComponent = iconsMap[page] || LayoutDashboard;
  const themeColor = colorsMap[page] || "#3B82F6";
  const breadcrumbs = breadcrumbsMap[page] || [{ label: "Dashboard", to: null }];

  return (
    <div
      className="px-4 py-3 md:px-6 md:py-3 flex items-center justify-between shrink-0 regional-admin-theme"
      style={{
        background: "var(--titlebar-bg)",
        borderBottom: "1px solid var(--glass-border)",
        backdropFilter: "blur(12px)",
        minHeight: "56px",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Scoped Icon Badge */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `${themeColor}18`,
            border: `1px solid ${themeColor}25`,
          }}
        >
          <IconComponent className="w-4 h-4" style={{ color: themeColor }} />
        </div>

        {/* Title and Breadcrumbs */}
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <ChevronRight
                    className="w-3 h-3"
                    style={{ color: "var(--text-muted)" }}
                  />
                )}
                {crumb.to ? (
                  <button
                    onClick={() => navigate(crumb.to)}
                    className="text-xs transition-all hover:underline cursor-pointer"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span
                    className="text-xs"
                    style={{ color: themeColor, fontWeight: 600 }}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>
          <div
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {subtitle || title}
          </div>
        </div>
      </div>

      {/* Action CTA Buttons based on active screen */}
      {page === "schools" && (
        <button
          onClick={() => navigate("/regional-admin/add-school")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold text-white transition-all hover:brightness-110 cursor-pointer"
          style={{ background: "var(--btn-primary)" }}
        >
          <Plus className="w-3 h-3" />
          Add School
        </button>
      )}
      {page === "districts" && (
        <button
          onClick={() => navigate("/regional-admin/add-district")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold text-white transition-all hover:brightness-110 cursor-pointer"
          style={{ background: "linear-gradient(135deg,#22C55E,#10B981)" }}
        >
          <Plus className="w-3 h-3" />
          Add District
        </button>
      )}
    </div>
  );
}
