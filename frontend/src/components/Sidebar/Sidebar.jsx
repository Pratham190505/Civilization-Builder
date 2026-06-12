import { NavLink } from "react-router-dom";
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
} from "react-icons/hi2";
import { useTheme } from "../../hooks/useTheme.jsx";
import darkLogo from "../../public/NewGDSLogo.png";
import lightLogo from "../../public/GDSLogoLight.jpeg";

const sections = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: HiOutlineSquares2X2, end: true },
      { to: "/india-map", label: "India Map", icon: HiOutlineMapPin },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/states", label: "States", icon: HiOutlineBuildingOffice2 },
      { to: "/regional-admins", label: "Regional Admins", icon: HiOutlineUserGroup },
      { to: "/schools", label: "Schools", icon: HiOutlineAcademicCap },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/media-approvals", label: "Media Approval", icon: HiOutlineFilm, badge: 143 },
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
  const brandLogo = theme === "dark" ? darkLogo : lightLogo;

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
        <div className="relative px-5 pb-5 pt-5">
          <div className="h-20 overflow-hidden border border-border bg-sidebar-hover/60 p-2 pr-10 lg:pr-2">
            <img
              src={brandLogo}
              alt="Global Discovery Schools"
              className="h-full w-full scale-x-[3.5] scale-y-[2.35] object-contain object-center"
            />
          </div>
          <button
            onClick={onCloseMobile}
            className="absolute right-5 top-5 rounded-md p-1 text-sidebar-muted hover:text-white lg:hidden"
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
                {section.items.map((item) => (
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
                      {item.badge != null && (
                        <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto flex items-center gap-3 border-t border-white/5 px-4 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
            AA
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Anurag Admin</p>
            <p className="truncate text-[11px] text-sidebar-muted">Super Admin</p>
          </div>
          <button
            className="rounded-md p-1.5 text-sidebar-muted hover:bg-sidebar-hover hover:text-primary"
            aria-label="Log out"
          >
            <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
          </button>
        </div>
      </aside>
    </>
  );
}
