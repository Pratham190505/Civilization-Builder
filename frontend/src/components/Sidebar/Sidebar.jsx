import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HiOutlineSquares2X2,
  HiOutlineMapPin,
  HiOutlineBuildingOffice2,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineFilm,
  HiOutlineTrophy,
  HiOutlineChartBar,
  HiOutlineBell,
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiXMark,
  HiOutlineGlobeAlt,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import { useTheme } from "../../hooks/useTheme.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";
import darkLogo from "../../public/logo-dark.png";
import lightLogo from "../../public/logo-light.png";
import { getNotifications } from "../../api/notifications";
import { getMediaList } from "../../api/media";
 
const sections = [
  {
    label: "Overview",
    items: [
      { to: "/super-admin", label: "Dashboard", icon: HiOutlineSquares2X2, end: true },
      { to: "/india-map", label: "India Map", icon: HiOutlineMapPin },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/states", label: "States", icon: HiOutlineBuildingOffice2 },
      { to: "/districts", label: "Districts", icon: HiOutlineGlobeAlt },
      { to: "/regional-admins", label: "Regional Admins", icon: HiOutlineUserGroup },
      { to: "/schools", label: "Schools", icon: HiOutlineAcademicCap },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/media-approvals", label: "Media Approval", icon: HiOutlineFilm, badge: 143 },
      { to: "/inspections", label: "Inspections", icon: HiOutlineClipboardDocumentCheck },
      { to: "/rankings", label: "Rankings", icon: HiOutlineTrophy },
      { to: "/reports", label: "Analytics", icon: HiOutlineChartBar },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/notifications", label: "Notifications", icon: HiOutlineBell, badge: 12 },
      { to: "/messages", label: "Messages", icon: HiOutlineChatBubbleLeftRight },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/users-roles", label: "Permissions", icon: HiOutlineShieldCheck },
      { to: "/activity-logs", label: "Audit Logs", icon: HiOutlineDocumentText },
      { to: "/settings", label: "Settings", icon: HiOutlineCog6Tooth },
    ],
  },
];

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const brandLogo = theme === "dark" ? darkLogo : lightLogo;

  const [mediaCount, setMediaCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchCounts = async () => {
      try {
        const [mediaRes, notificationsRes] = await Promise.all([
          getMediaList(),
          getNotifications()
        ]);
        
        if (active) {
          if (mediaRes.success && Array.isArray(mediaRes.data)) {
            const pending = mediaRes.data.filter(m => m.status === "SUBMITTED").length;
            setMediaCount(pending);
          }
          if (notificationsRes.success && Array.isArray(notificationsRes.data)) {
            const unread = notificationsRes.data.filter(n => !n.is_read).length;
            setNotificationCount(unread);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sidebar counts:", err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "SA";
  const fullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`
    : "Super Admin";

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-65 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="relative px-3 pb-5 pt-5">
          <div className="h-20 overflow-hidden flex items-center justify-center">
            <img
              src={brandLogo}
              alt="Global Discovery Schools"
              className="max-h-full max-w-full object-contain scale-[1.25] transition-transform duration-300 hover:scale-[1.3]"
            />
          </div>
          <button
            onClick={onCloseMobile}
            className="absolute right-5 top-5 rounded-md p-1 text-sidebar-muted hover:text-primary lg:hidden"
            aria-label="Close menu"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4">
          {sections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="px-3 pb-2 pt-2 text-[10px] font-semibold tracking-[0.18em] text-sidebar-muted">
                {section.label.toUpperCase()}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  let badge = item.badge;
                  if (item.to === "/media-approvals") {
                    badge = mediaCount;
                  } else if (item.to === "/notifications") {
                    badge = notificationCount;
                  }
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-sidebar-active text-primary shadow-sm"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-hover hover:text-primary"
                          }`
                        }
                      >
                        <item.icon className="h-4.5 w-4.5 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {badge != null && badge > 0 && (
                          <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            {badge}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto flex items-center gap-3 border-t border-border px-4 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{fullName}</p>
            <p className="truncate text-[11px] text-sidebar-muted">Super Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md p-1.5 text-sidebar-muted hover:bg-sidebar-hover hover:text-primary animate-pulse"
            aria-label="Log out"
          >
            <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
          </button>
        </div>
      </aside>
    </>
  );
}
