import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut
} from "lucide-react";
import { notifications } from "../../data/regionalAdminMockData.js";

export default function RegionalAdminNavbar({ darkMode, onToggleDark }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const unreadCount = notifications.filter((item) => item.unread).length;

  const closeDropdowns = () => {
    setShowProfileMenu(false);
    setShowNotifications(false);
  };

  return (
    <header
      className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4 shrink-0 regional-admin-theme"
      style={{
        background: "var(--header-bg)",
        borderBottom: "1px solid var(--glass-border)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Bottom Gradient Accent border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)",
        }}
      />

      {/* Global Search Bar */}
      <div className="flex-1 min-w-[220px] max-w-md relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          placeholder="Search schools, districts, inspections..."
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm outline-none transition-all"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Top right utility tools */}
      <div className="flex items-center gap-2.5 justify-end flex-shrink-0">
        {/* Date Display */}
        <span
          className="text-xs hidden lg:block"
          style={{ color: "var(--text-muted)" }}
        >
          {formattedDate}
        </span>

        {/* Region Indicator */}
        <span
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
          style={{
            background: "rgba(59, 130, 246, 0.09)",
            color: "#3B82F6",
            border: "1px solid rgba(59, 130, 246, 0.18)",
            fontWeight: 600,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
          Gujarat Region
        </span>

        {/* Theme Toggler Button */}
        <motion.button
          onClick={onToggleDark}
          whileTap={{ rotate: 15, scale: 0.9 }}
          className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-secondary)",
          }}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={darkMode ? "dark" : "light"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Notifications Dropdown Container */}
        <div className="relative">
          <motion.button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-xl flex items-center justify-center relative cursor-pointer"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
            }}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{
                  background: "#EF4444",
                  fontSize: 8,
                  fontWeight: 700,
                }}
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.16 }}
                className="absolute right-0 top-full mt-3 w-80 md:w-96 rounded-2xl shadow-xl z-50 overflow-hidden"
                style={{
                  background: "var(--dropdown-bg)",
                  border: "1px solid var(--glass-border)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--glass-border)" }}
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-primary)", fontWeight: 700 }}
                  >
                    Notifications
                  </span>
                  <button
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{
                      color: "#3B82F6",
                      background: "rgba(59, 130, 246, 0.1)",
                    }}
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 flex gap-3 items-start cursor-pointer hover:bg-[var(--glass-hover)] transition-colors"
                      style={{
                        borderBottom: "1px solid var(--glass-border)",
                        background: item.unread
                          ? "rgba(59, 130, 246, 0.06)"
                          : "transparent",
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{
                          background: item.unread ? "#3B82F6" : "transparent",
                        }}
                      />
                      <div className="flex-1">
                        <p
                          className="text-xs leading-snug"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.text}
                        </p>
                        <p
                          className="text-[10px] mt-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="px-4 py-2.5 text-center"
                  style={{ borderTop: "1px solid var(--glass-border)" }}
                >
                  <button
                    className="text-xs font-semibold"
                    style={{ color: "#3B82F6" }}
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <motion.button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-[#6366F1]">
              SA
            </div>
            <span
              className="text-xs hidden md:block"
              style={{ color: "var(--text-primary)", fontWeight: 600 }}
            >
              State Admin
            </span>
            <ChevronDown
              className="w-3.5 h-3.5 hidden md:block"
              style={{ color: "var(--text-muted)" }}
            />
          </motion.button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.16 }}
                className="absolute right-0 top-full mt-3 w-56 rounded-2xl shadow-xl z-50 overflow-hidden"
                style={{
                  background: "var(--dropdown-bg)",
                  border: "1px solid var(--glass-border)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                }}
              >
                <div
                  className="px-4 py-3"
                  style={{ borderBottom: "1px solid var(--glass-border)" }}
                >
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-primary)", fontWeight: 600 }}
                  >
                    State Admin
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    admin@gujarat.gov.in
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/regional-admin/settings");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left text-[var(--text-secondary)] hover:bg-[var(--glass-hover)] transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile Info
                  </button>
                  <button
                    onClick={() => {
                      navigate("/regional-admin/settings");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left text-[var(--text-secondary)] hover:bg-[var(--glass-hover)] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("authenticated");
                      localStorage.removeItem("role");
                      navigate("/login", { replace: true });
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left text-red-400 hover:bg-[var(--glass-hover)] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Backdrop overlay for closing dropdowns when clicking outside */}
      {(showProfileMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onClick={closeDropdowns}
        />
      )}
    </header>
  );
}
