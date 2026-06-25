import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  LogOut,
  Sparkles
} from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";
import { getPageMeta } from "../../lib/pageMeta.js";
import { useAuth } from "../../hooks/useAuth.jsx";
import { getNotifications, markNotificationsAsRead } from "../../api/notifications";
import { globalSearch } from "../../api/security";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5003";

export default function Navbar({ onOpenMobile, title, subtitle }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  
  // Resolve page meta for title/subtitle if not provided explicitly as props
  const meta = getPageMeta(pathname);
  const displayTitle = title || meta.title;
  const displaySubtitle = subtitle || meta.subtitle;

  const [notificationsList, setNotificationsList] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const getRouteForEntity = (type, id) => {
    if (role === "super") {
      switch (type) {
        case "State": return "/states";
        case "District": return "/districts";
        case "School": return "/schools";
        case "Regional Admin": return "/regional-admins";
        case "School Admin": return "/schools";
        case "Media": return "/media-approvals";
        case "Inspection": return "/inspections";
        case "Ranking": return "/rankings";
        default: return "/super-admin";
      }
    } else if (role === "regional") {
      switch (type) {
        case "State": return "/regional-admin/schools";
        case "District": return "/regional-admin/districts";
        case "School": return "/regional-admin/schools";
        case "Regional Admin": return "/regional-admin";
        case "School Admin": return "/regional-admin/schools";
        case "Media": return "/regional-admin/videos";
        case "Inspection": return "/regional-admin/inspections";
        case "Ranking": return "/regional-admin/rankings";
        default: return "/regional-admin";
      }
    } else if (role === "school") {
      switch (type) {
        case "State": return "/school-admin/schools";
        case "District": return "/school-admin/districts";
        case "School": return "/school-admin/schools";
        case "Regional Admin": return "/school-admin";
        case "School Admin": return "/school-admin/settings";
        case "Media": return "/school-admin/media-approval";
        case "Inspection": return "/school-admin";
        case "Ranking": return "/school-admin/rankings";
        default: return "/school-admin";
      }
    }
    return "/";
  };

  const getFlatResultsList = () => {
    if (!searchResults) return [];
    const list = [];
    const categories = ["states", "districts", "schools", "regionalAdmins", "schoolAdmins", "media", "inspections", "rankings"];
    categories.forEach(cat => {
      if (Array.isArray(searchResults[cat])) {
        searchResults[cat].forEach(item => {
          list.push({ ...item, category: cat });
        });
      }
    });
    return list;
  };

  const flatResults = getFlatResultsList();

  const isFocused = (itemType, itemId) => {
    const currentFocused = flatResults[focusedIndex];
    return currentFocused && currentFocused.type === itemType && currentFocused.id === itemId;
  };

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotificationsList(res.data);
      }
    } catch (err) {
      console.error("Failed to load notifications in common Navbar:", err);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleNewNotification = () => {
      loadNotifications();
    };

    window.addEventListener("new_notification", handleNewNotification);
    return () => {
      window.removeEventListener("new_notification", handleNewNotification);
    };
  }, []);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await globalSearch(searchQuery);
        if (res.success) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => (flatResults.length > 0 ? (prev + 1) % flatResults.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => (flatResults.length > 0 ? (prev - 1 + flatResults.length) % flatResults.length : -1));
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && focusedIndex < flatResults.length) {
        e.preventDefault();
        const selectedItem = flatResults[focusedIndex];
        const route = getRouteForEntity(selectedItem.type, selectedItem.id);
        navigate(route);
        setShowSearchDropdown(false);
        setSearchQuery("");
        setFocusedIndex(-1);
      } else if (flatResults.length > 0) {
        e.preventDefault();
        const selectedItem = flatResults[0];
        const route = getRouteForEntity(selectedItem.type, selectedItem.id);
        navigate(route);
        setShowSearchDropdown(false);
        setSearchQuery("");
        setFocusedIndex(-1);
      }
    } else if (e.key === "Escape") {
      setShowSearchDropdown(false);
      setFocusedIndex(-1);
      e.currentTarget.blur();
    }
  };

  const hasSearchResults = searchResults && (
    (searchResults.states?.length || 0) +
    (searchResults.districts?.length || 0) +
    (searchResults.schools?.length || 0) +
    (searchResults.regionalAdmins?.length || 0) +
    (searchResults.schoolAdmins?.length || 0) +
    (searchResults.media?.length || 0) +
    (searchResults.inspections?.length || 0) +
    (searchResults.rankings?.length || 0)
  ) > 0;

  const unreadCount = notificationsList.filter((item) => !item.is_read).length;

  const userInitials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "AA";
  const userFullName = user
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : "Administrator";
  const userEmail = user?.email || "admin@discovery.gov.in";

  // Determine permissions/scope descriptor
  const scopedRegion = role === "regional" 
    ? (user?.scope?.stateName || user?.scope?.stateCode || "Gujarat Region")
    : role === "school"
      ? (user?.scope?.schoolName || "Assigned School")
      : "All Regions";

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

  const handleMarkAllRead = async () => {
    const unreadIds = notificationsList.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    try {
      const res = await markNotificationsAsRead(unreadIds);
      if (res.success) {
        toast.success("All notifications marked as read");
        loadNotifications();
        window.dispatchEvent(new CustomEvent("notification_read"));
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
        window.dispatchEvent(new CustomEvent("notification_read"));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleLogoutClick = async () => {
    try {
      setShowProfileMenu(false);
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error("Logout failed: " + err.message);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl shrink-0">
      {/* Backdrop overlay for closing dropdowns when clicking outside */}
      {(showProfileMenu || showNotifications || showSearchDropdown) && (
        <div
          className="fixed inset-0 z-20 bg-transparent"
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
            setShowSearchDropdown(false);
          }}
        />
      )}

      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8 relative z-30 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMobile && (
            <button
              onClick={onOpenMobile}
              className="rounded-lg p-2 text-foreground hover:bg-muted lg:hidden cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">{displayTitle}</h1>
            <p className="hidden truncate text-[11px] text-muted-foreground sm:block">{displaySubtitle}</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden flex-1 max-w-xs md:block mx-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search everything..."
            className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-12 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-all"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground select-none pointer-events-none">
            ⌘K
          </kbd>

          {showSearchDropdown && searchQuery && (
            <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl z-50 p-2 text-xs text-foreground divide-y divide-border">
              {!hasSearchResults ? (
                <div className="px-3 py-4 text-center text-muted-foreground">No results found</div>
              ) : (
                <>
                  {searchResults.schools?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Schools</p>
                      {searchResults.schools.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { navigate(getRouteForEntity("School", s.id)); setShowSearchDropdown(false); setSearchQuery(""); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent transition-colors ${
                            isFocused("School", s.id) ? "bg-muted" : "hover:bg-muted"
                          }`}
                        >
                          <span className="font-semibold text-foreground">{s.name}</span>
                          <span className="text-[10px] text-muted-foreground">View details</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.states?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">States</p>
                      {searchResults.states.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { navigate(getRouteForEntity("State", s.id)); setShowSearchDropdown(false); setSearchQuery(""); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent transition-colors ${
                            isFocused("State", s.id) ? "bg-muted" : "hover:bg-muted"
                          }`}
                        >
                          <span className="font-semibold text-foreground">{s.name}</span>
                          <span className="text-[10px] text-muted-foreground">View details</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.districts?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Districts</p>
                      {searchResults.districts.map(d => (
                        <button
                          key={d.id}
                          onClick={() => { navigate(getRouteForEntity("District", d.id)); setShowSearchDropdown(false); setSearchQuery(""); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent transition-colors ${
                            isFocused("District", d.id) ? "bg-muted" : "hover:bg-muted"
                          }`}
                        >
                          <span className="font-semibold text-foreground">{d.name}</span>
                          <span className="text-[10px] text-muted-foreground">View details</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.regionalAdmins?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Regional Admins</p>
                      {searchResults.regionalAdmins.map(a => (
                        <button
                          key={a.id}
                          onClick={() => { navigate(getRouteForEntity("Regional Admin", a.id)); setShowSearchDropdown(false); setSearchQuery(""); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent transition-colors ${
                            isFocused("Regional Admin", a.id) ? "bg-muted" : "hover:bg-muted"
                          }`}
                        >
                          <span className="font-semibold text-foreground">{a.name}</span>
                          <span className="text-[10px] text-muted-foreground">View profile</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.schoolAdmins?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">School Admins</p>
                      {searchResults.schoolAdmins.map(a => (
                        <button
                          key={a.id}
                          onClick={() => { navigate(getRouteForEntity("School Admin", a.id)); setShowSearchDropdown(false); setSearchQuery(""); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent transition-colors ${
                            isFocused("School Admin", a.id) ? "bg-muted" : "hover:bg-muted"
                          }`}
                        >
                          <span className="font-semibold text-foreground">{a.name}</span>
                          <span className="text-[10px] text-muted-foreground">View profile</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.media?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Media Approvals</p>
                      {searchResults.media.map(m => (
                        <button
                          key={m.id}
                          onClick={() => { navigate(getRouteForEntity("Media", m.id)); setShowSearchDropdown(false); setSearchQuery(""); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent transition-colors ${
                            isFocused("Media", m.id) ? "bg-muted" : "hover:bg-muted"
                          }`}
                        >
                          <span className="font-semibold text-foreground truncate max-w-[200px]">{m.name}</span>
                          <span className="text-[10px] text-muted-foreground">Review Submission</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.inspections?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Inspections</p>
                      {searchResults.inspections.map(i => (
                        <button
                          key={i.id}
                          onClick={() => { navigate(getRouteForEntity("Inspection", i.id)); setShowSearchDropdown(false); setSearchQuery(""); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent transition-colors ${
                            isFocused("Inspection", i.id) ? "bg-muted" : "hover:bg-muted"
                          }`}
                        >
                          <span className="font-semibold text-foreground truncate max-w-[200px]">{i.name}</span>
                          <span className="text-[10px] text-muted-foreground">View details</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.rankings?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rankings</p>
                      {searchResults.rankings.map(r => (
                        <button
                          key={r.id}
                          onClick={() => { navigate(getRouteForEntity("Ranking", r.id)); setShowSearchDropdown(false); setSearchQuery(""); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent transition-colors ${
                            isFocused("Ranking", r.id) ? "bg-muted" : "hover:bg-muted"
                          }`}
                        >
                          <span className="font-semibold text-foreground truncate max-w-[200px]">{r.name}</span>
                          <span className="text-[10px] text-muted-foreground">View rankings</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Utilities & Profile Section */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Scoped Pill Indicator */}
          {role && (
            <span
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold border border-primary/20 bg-primary/5 text-primary select-none"
            >
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              {role === "super" && "Super Admin · All Regions"}
              {role === "regional" && `Regional Admin · ${scopedRegion}`}
              {role === "school" && `School Admin · ${scopedRegion}`}
            </span>
          )}

          <ThemeToggle />
          
          {/* Notifications Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative rounded-xl border border-border bg-surface p-2 text-foreground hover:bg-muted cursor-pointer transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 md:w-96 rounded-2xl border border-border bg-surface shadow-2xl z-50 overflow-hidden flex flex-col"
                >
                  <div className="px-4 py-3 flex items-center justify-between border-b border-border">
                    <span className="text-xs font-bold text-foreground">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] px-2 py-1 rounded-lg border-0 cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-border">
                    {notificationsList.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                        No notifications available
                      </div>
                    ) : (
                      notificationsList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`px-4 py-3 flex gap-3 items-start cursor-pointer transition-colors ${
                            !item.is_read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                              !item.is_read ? "bg-primary animate-pulse" : "bg-transparent"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs leading-snug font-medium text-foreground">
                              {item.Notification?.message || item.Notification?.title}
                            </p>
                            <p className="text-[9px] mt-1 text-muted-foreground">
                              {formatTimeAgo(item.Notification?.created_at || item.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {role !== "regional" && (
                    <div className="px-4 py-2.5 text-center border-t border-border bg-muted/10">
                      <button
                        onClick={() => {
                          const path = role === "school" ? "/school-admin/notifications" : "/notifications";
                          navigate(path);
                          setShowNotifications(false);
                        }}
                        className="text-[10px] font-bold border-0 bg-transparent text-primary hover:underline cursor-pointer"
                      >
                        View All Notifications
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Profile Menu Trigger */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface py-1.5 pl-1.5 pr-2.5 hover:bg-muted cursor-pointer transition-all"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-[11px] font-bold text-white shadow-sm">
                {userInitials}
              </span>
              <span className="hidden text-xs font-semibold text-foreground sm:inline">{userFullName}</span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline transition-transform duration-200" style={{ transform: showProfileMenu ? "rotate(180deg)" : "none" }} />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-surface shadow-2xl z-50 p-2 text-xs text-foreground divide-y divide-border"
                >
                  {/* Top Section */}
                  <div className="flex items-center gap-3 p-3 select-none">
                    <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-md">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{userFullName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1.5 space-y-0.5">
                    <button 
                      onClick={() => {
                        const path = role === "regional" 
                          ? "/regional-admin/settings" 
                          : role === "school" 
                            ? "/school-admin/settings" 
                            : "/settings";
                        navigate(path);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted/60 hover:text-foreground rounded-xl flex items-center gap-2 cursor-pointer border-0 bg-transparent text-muted-foreground font-medium transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-muted-foreground/80" />
                      Account Details
                    </button>
                    <button 
                      onClick={() => {
                        const path = role === "regional" 
                          ? "/regional-admin/settings" 
                          : role === "school" 
                            ? "/school-admin/settings" 
                            : "/settings";
                        navigate(path);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted/60 hover:text-foreground rounded-xl flex items-center gap-2 cursor-pointer border-0 bg-transparent text-muted-foreground font-medium transition-colors"
                    >
                      <SettingsIcon className="w-3.5 h-3.5 text-muted-foreground/80" />
                      Settings
                    </button>
                  </div>

                  {/* Logout Section */}
                  <div className="py-1.5">
                    <button 
                      onClick={handleLogoutClick}
                      className="w-full text-left px-3 py-2 hover:bg-danger/10 hover:text-danger rounded-xl flex items-center gap-2 cursor-pointer border-0 bg-transparent text-rose-400 font-medium transition-colors"
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
      </div>
    </header>
  );
}
