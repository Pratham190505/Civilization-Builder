import { Search, Bell, Sun, Moon, ChevronDown } from "lucide-react";

export default function SchoolAdminNavbar({
  title,
  subtitle,
  darkMode,
  onToggleDark,
}) {
  const headerBg = darkMode
    ? "rgba(8,13,26,0.9)"
    : "rgba(248,251,255,0.9)";
  const headerBorder = darkMode
    ? "1px solid rgba(255,255,255,0.06)"
    : "1px solid rgba(59,130,246,0.15)";
  const titleColor = darkMode ? "#e2e8f0" : "#0f172a";
  const subtitleColor = darkMode ? "#8892a4" : "#64748b";
  const controlBg = darkMode
    ? "rgba(255,255,255,0.05)"
    : "rgba(59,130,246,0.06)";
  const controlBorder = darkMode
    ? "1px solid rgba(255,255,255,0.07)"
    : "1px solid rgba(59,130,246,0.15)";
  const iconColor = darkMode ? "#8892a4" : "#94a3b8";
  const inputColor = darkMode ? "#e2e8f0" : "#0f172a";
  const toggleIconColor = darkMode ? "#f59e0b" : "#4f7fff";
  const buttonTextColor = darkMode ? "#e2e8f0" : "#0f172a";
  const dropdownColor = darkMode ? "#8892a4" : "#64748b";

  return (
    <header
      className="h-16 flex items-center justify-between px-6 gap-4"
      style={{
        background: headerBg,
        backdropFilter: "blur(12px)",
        borderBottom: headerBorder,
      }}
    >
      <div>
        <h1
          className="font-semibold leading-tight"
          style={{ color: titleColor, fontSize: "1rem" }}
        >
          {title}
        </h1>
        <p className="text-xs" style={{ color: subtitleColor }}>
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: controlBg, border: controlBorder }}
        >
          <Search size={14} style={{ color: iconColor }} />
          <input
            placeholder="Search..."
            className="bg-transparent outline-none text-sm w-40"
            style={{ color: inputColor }}
          />
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: controlBg, color: iconColor }}
          >
            ⌘K
          </span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: controlBg, border: controlBorder }}
        >
          {darkMode ? (
            <Sun size={16} style={{ color: toggleIconColor }} />
          ) : (
            <Moon size={16} style={{ color: toggleIconColor }} />
          )}
        </button>

        {/* Bell */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all"
          style={{ background: controlBg, border: controlBorder }}
        >
          <Bell size={16} style={{ color: buttonTextColor }} />
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white"
            style={{ background: "#ef4444", fontSize: "9px" }}
          >
            3
          </span>
        </button>

        {/* Profile */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
          style={{ background: controlBg, border: controlBorder }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #4f7fff, #8b5cf6)",
            }}
          >
            SA
          </div>
          <span
            className="text-sm font-medium hidden md:block"
            style={{ color: buttonTextColor }}
          >
            School Admin
          </span>
          <ChevronDown size={14} style={{ color: dropdownColor }} />
        </div>
      </div>
    </header>
  );
}
