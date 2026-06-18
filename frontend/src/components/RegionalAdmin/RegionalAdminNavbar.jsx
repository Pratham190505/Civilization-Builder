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
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.jsx";
import { getNotifications, markNotificationsAsRead } from "../../api/notifications";
import { toast } from "sonner";

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "recently";
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (isNaN(seconds)) return "recently";
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function RegionalAdminNavbar({ darkMode, onToggleDark }) {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const navigate = useNavigate();

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotificationsList(res.data);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Listen for new real-time socket notifications
    const handleNewNotification = () => {
      loadNotifications();
    };
    
    window.addEventListener("new_notification", handleNewNotification);
    return () => {
      window.removeEventListener("new_notification", handleNewNotification);
    };
  }, []);

  const unreadCount = notificationsList.filter((item) => !item.is_read).length;

  const closeDropdowns = () => {
    setShowProfileMenu(false);
    setShowNotifications(false);
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notificationsList.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    try {
      const res = await markNotificationsAsRead(unreadIds);
      if (res.success) {
        toast.success("All notifications marked as read");
        loadNotifications();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update notifications");
    }
  };

  const handleNotificationClick = async (item) => {
    if (item.is_read) return;
    try {
      const res = await markNotificationsAsRead([item.id]);
      if (res.success) {
        loadNotifications();
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error("Logout failed: " + err.message);
    }
  };

  // User details
  const userInitials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "RA"
    : "RA";
  const userFullName = user
    ? `${user.first_name || "Regional"} ${user.last_name || "Admin"}`
    : "Regional Admin";
  const userEmail = user?.email || "admin@gujarat.gov.in";
  
  // Scoped region name
  const scopedRegion = user?.scope?.stateName || user?.scope?.stateCode || "Gujarat Region";

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
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs animate-fade-in"
          style={{
            background: "rgba(59, 130, 246, 0.09)",
            color: "#3B82F6",
            border: "1px solid rgba(59, 130, 246, 0.18)",
            fontWeight: 600,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
          {scopedRegion}
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
                    onClick={handleMarkAllRead}
                    className="text-xs px-2 py-1 rounded-lg border-0 cursor-pointer"
                    style={{
                      color: "#3B82F6",
                      background: "rgba(59, 130, 246, 0.1)",
                    }}
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notificationsList.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-[var(--text-muted)]">
                      No notifications available.
                    </div>
                  ) : (
                    notificationsList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className="px-4 py-3 flex gap-3 items-start cursor-pointer hover:bg-[var(--glass-hover)] transition-colors"
                        style={{
                          borderBottom: "1px solid var(--glass-border)",
                          background: !item.is_read
                            ? "rgba(59, 130, 246, 0.06)"
                            : "transparent",
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{
                            background: !item.is_read ? "#3B82F6" : "transparent",
                          }}
                        />
                        <div className="flex-1">
                          <p
                            className="text-xs leading-snug font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.Notification?.message || item.Notification?.title}
                          </p>
                          <p
                            className="text-[10px] mt-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {formatTimeAgo(item.Notification?.created_at || item.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div
                  className="px-4 py-2.5 text-center"
                  style={{ borderTop: "1px solid var(--glass-border)" }}
                >
                  <button
                    onClick={() => {
                      navigate("/regional-admin/dashboard");
                      setShowNotifications(false);
                    }}
                    className="text-xs font-semibold border-0 bg-transparent cursor-pointer"
                    style={{ color: "#3B82F6" }}
                  >
                    Close Menu
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
              {userInitials}
            </div>
            <span
              className="text-xs hidden md:block"
              style={{ color: "var(--text-primary)", fontWeight: 600 }}
            >
              {userFullName}
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
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {userFullName}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {userEmail}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/regional-admin/settings");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left text-[var(--text-secondary)] hover:bg-[var(--glass-hover)] transition-colors border-0 cursor-pointer bg-transparent"
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile Info
                  </button>
                  <button
                    onClick={() => {
                      navigate("/regional-admin/settings");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left text-[var(--text-secondary)] hover:bg-[var(--glass-hover)] transition-colors border-0 cursor-pointer bg-transparent"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left text-red-400 hover:bg-[var(--glass-hover)] transition-colors border-0 cursor-pointer bg-transparent"
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
