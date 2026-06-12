import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  School,
  Video,
  Map,
  Trophy,
  ClipboardList,
  Settings,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme.jsx";
import darkLogo from "../../public/logo-dark.png";
import lightLogo from "../../public/logo-light.png";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/regional-admin", end: true },
  { id: "schools", label: "Schools", icon: School, to: "/regional-admin/schools" },
  { id: "videos", label: "Videos & Media", icon: Video, to: "/regional-admin/videos" },
  { id: "districts", label: "Districts", icon: Map, to: "/regional-admin/districts" },
  { id: "rankings", label: "Rankings", icon: Trophy, to: "/regional-admin/rankings" },
  { id: "inspections", label: "Inspection Reports", icon: ClipboardList, to: "/regional-admin/inspections" },
  { id: "settings", label: "Settings", icon: Settings, to: "/regional-admin/settings" },
];

export default function RegionalAdminSidebar() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const brandLogo = theme === "dark" ? darkLogo : lightLogo;

  return (
    <aside
      className="w-[280px] h-full flex flex-col shrink-0 relative regional-admin-theme"
      style={{
        background: "var(--sidebar-bg, var(--glass-card))",
        borderRight: "1px solid var(--glass-border)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Top Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)",
        }}
      />

      {/* Brand logo container */}
      <div className="relative px-3 pb-5 pt-5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
        <div className="h-20 overflow-hidden flex items-center justify-center">
          <img
            src={brandLogo}
            alt="Global Discovery Schools"
            className="max-h-full max-w-full object-contain scale-[1.25] transition-transform duration-300 hover:scale-[1.3]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>

      {/* Navigation section header */}
      <div className="px-5 pt-4 pb-1">
        <span
          className="text-xs tracking-widest"
          style={{
            color: "var(--text-muted)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Navigation
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 pb-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left relative overflow-hidden transition-all group ${
                  isActive ? "text-primary-foreground font-semibold" : "text-[var(--text-secondary)]"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: "linear-gradient(135deg, rgba(108, 99, 255, 0.22), rgba(59, 130, 246, 0.16))",
                      border: "1px solid rgba(108, 99, 255, 0.25)",
                      boxShadow: "0 12px 30px rgba(108, 99, 255, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      color: "var(--text-primary)",
                    }
                  : {
                      background: "transparent",
                      border: "1px solid transparent",
                      color: "var(--text-secondary)",
                    }
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBg"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(99, 102, 241, 0.05))",
                      }}
                    />
                  )}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative z-10 transition-all"
                    style={
                      isActive
                        ? {
                            background: "linear-gradient(135deg, #6C63FF, #3B82F6)",
                            boxShadow: "0 8px 22px rgba(108, 99, 255, 0.22)",
                          }
                        : { background: "rgba(255, 255, 255, 0.05)" }
                    }
                  >
                    <IconComponent
                      className="w-4 h-4 transition-transform group-hover:scale-110"
                      style={{ color: isActive ? "#fff" : "var(--text-muted)" }}
                    />
                  </div>
                  <span className="text-sm flex-1 relative z-10">
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative z-10"
                    >
                      <ChevronRight
                        className="w-3.5 h-3.5"
                        style={{ color: "#6366F1" }}
                      />
                    </motion.div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-5 py-2">
        <div className="h-px" style={{ background: "var(--glass-border)" }} />
      </div>

      {/* Online Status Badge */}
      <div className="px-4 pb-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: "rgba(59, 130, 246, 0.07)",
            border: "1px solid rgba(59, 130, 246, 0.15)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#10B981" }}
          />
          <span
            className="text-xs"
            style={{ color: "var(--text-secondary)", fontWeight: 500 }}
          >
            Gujarat State — Online
          </span>
        </div>
      </div>

      {/* User Footer profile section */}
      <div
        className="p-3"
        style={{ borderTop: "1px solid var(--glass-border)" }}
      >
        <div
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-[var(--glass-hover)] transition-all"
          onClick={() => navigate("/regional-admin/settings")}
        >
          <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-[#6366F1]">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-sm truncate"
              style={{ color: "var(--text-primary)", fontWeight: 600 }}
            >
              State Admin
            </div>
            <div
              className="text-xs truncate"
              style={{ color: "var(--text-muted)" }}
            >
              admin@gujarat.gov.in
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              localStorage.removeItem("authenticated");
              localStorage.removeItem("role");
              navigate("/login", { replace: true });
            }}
            className="p-1.5 rounded-lg transition-all hover:bg-[var(--glass-hover)] hover:text-red-400 text-[var(--text-muted)]"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
