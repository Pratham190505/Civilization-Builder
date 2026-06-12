import {
  LayoutDashboard,
  School,
  Map,
  Upload,
  CheckSquare,
  Trophy,
  BarChart3,
  Lightbulb,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import SchoolAdminLogo from "./SchoolAdminLogo.jsx";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "schools", label: "Schools", icon: School },
  { id: "districts", label: "Districts", icon: Map },
  { id: "uploads", label: "Uploads", icon: Upload },
  { id: "media-approval", label: "Media Approval", icon: CheckSquare, badge: 8 },
  { id: "rankings", label: "Rankings", icon: Trophy },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  { id: "notifications", label: "Notifications", icon: Bell, badge: 3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function SchoolAdminSidebar({
  activePage,
  onNavigate,
  darkMode,
}) {
  const sidebarBg = darkMode ? "#0d1127" : "#f8fbff";
  const sidebarBorder = darkMode
    ? "1px solid rgba(255,255,255,0.06)"
    : "1px solid rgba(59,130,246,0.15)";
  const sidebarText = darkMode ? "#e2e8f0" : "#0f172a";
  const mutedText = darkMode
    ? "rgba(255,255,255,0.3)"
    : "rgba(15,23,42,0.5)";
  const accentColor = darkMode ? "#4f7fff" : "#2563eb";
  const hoveredBg = darkMode
    ? "rgba(255,255,255,0.04)"
    : "rgba(59,130,246,0.06)";
  const activeBgColor = darkMode
    ? "linear-gradient(135deg, rgba(79,127,255,0.25), rgba(139,92,246,0.15))"
    : "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))";
  const activeBorderColor = darkMode
    ? "rgba(79,127,255,0.3)"
    : "rgba(59,130,246,0.3)";
  const badgeDangerBg = darkMode
    ? "rgba(239,68,68,0.2)"
    : "rgba(239,68,68,0.15)";
  const inactiveIconColor = darkMode
    ? "rgba(255,255,255,0.45)"
    : "rgba(15,23,42,0.45)";
  const inactiveTextColor = darkMode
    ? "rgba(255,255,255,0.6)"
    : "rgba(15,23,42,0.7)";
  const profileBg = darkMode
    ? "rgba(255,255,255,0.04)"
    : "rgba(59,130,246,0.06)";
  const profileText = darkMode ? "#e2e8f0" : "#0f172a";
  const profileMutedText = darkMode
    ? "rgba(255,255,255,0.4)"
    : "rgba(15,23,42,0.6)";
  const borderColor = darkMode
    ? "1px solid rgba(255,255,255,0.06)"
    : "1px solid rgba(59,130,246,0.15)";

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-40"
      style={{ background: sidebarBg, borderRight: sidebarBorder }}
    >
      {/* Logo */}
      <div
        className="px-4 py-3 flex items-center justify-center h-28"
        style={{ borderBottom: borderColor }}
      >
        <div
          style={{
            border: "1px solid #2f4f8f",
            borderRadius: "8px",
            padding: "8px",
            backgroundColor: "transparent",
          }}
        >
          <SchoolAdminLogo
            darkMode={darkMode}
            maxWidth="220px"
            maxHeight="90px"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-1 px-2 pb-2">
          <span
            className="text-xs font-semibold tracking-wider"
            style={{ color: mutedText }}
          >
            MAIN MENU
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full text-left px-3 py-3 rounded-xl mb-1 transition-all flex items-center justify-between group"
              style={{
                background: isActive ? activeBgColor : "transparent",
                border: isActive
                  ? `1px solid ${activeBorderColor}`
                  : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = hoveredBg;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon
                  size={18}
                  style={{
                    color: isActive ? accentColor : inactiveIconColor,
                  }}
                />
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isActive ? accentColor : inactiveTextColor,
                  }}
                >
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: badgeDangerBg,
                    color: "#ef4444",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div
        className="p-3 mx-3 mb-3 rounded-xl flex items-center gap-3"
        style={{ background: profileBg, border: borderColor }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #4f7fff, #8b5cf6)",
          }}
        >
          SA
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold" style={{ color: profileText }}>
            School Admin
          </div>
          <div
            className="text-xs"
            style={{ color: profileMutedText }}
          >
            Logged in
          </div>
        </div>
        <button
          className="w-6 h-6 rounded flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ background: "transparent" }}
          title="Logout"
        >
          <LogOut size={16} style={{ color: profileMutedText }} />
        </button>
      </div>
    </aside>
  );
}
