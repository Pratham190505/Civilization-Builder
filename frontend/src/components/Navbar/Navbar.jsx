import { HiOutlineMagnifyingGlass, HiOutlineBell, HiOutlineBars3, HiChevronDown } from "react-icons/hi2";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle.jsx";
import { getPageMeta } from "../../lib/pageMeta.js";
import { useAuth } from "../../hooks/useAuth.jsx";
import { getNotifications } from "../../api/notifications";
import { globalSearch } from "../../api/security";

export default function Navbar({ onOpenMobile }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const meta = getPageMeta(pathname);
  
  const [notificationsList, setNotificationsList] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotificationsList(res.data);
      }
    } catch (err) {
      console.error("Failed to load notifications in Navbar:", err);
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
    if (e.key === "Enter") {
      if (searchResults) {
        const firstCategory = Object.keys(searchResults).find(key => searchResults[key]?.length > 0);
        if (firstCategory) {
          const firstItem = searchResults[firstCategory][0];
          navigate(firstItem.route);
          setShowSearchDropdown(false);
          setSearchQuery("");
        }
      }
    }
  };

  const hasSearchResults = searchResults && (
    (searchResults.states?.length || 0) +
    (searchResults.admins?.length || 0) +
    (searchResults.schools?.length || 0) +
    (searchResults.media?.length || 0) +
    (searchResults.notifications?.length || 0) +
    (searchResults.rankings?.length || 0) +
    (searchResults.messages?.length || 0)
  ) > 0;

  const unreadCount = notificationsList.filter((item) => !item.is_read).length;

  const userInitials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "AA";
  const userFullName = user
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : "Anurag Admin";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      {/* Backdrop overlay for closing dropdowns when clicking outside */}
      {(showProfileMenu || showSearchDropdown) && (
        <div
          className="fixed inset-0 z-20 bg-transparent"
          onClick={() => { setShowProfileMenu(false); setShowSearchDropdown(false); }}
        />
      )}

      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8 relative z-30">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-foreground hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <HiOutlineBars3 className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{meta.title}</h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{meta.subtitle}</p>
        </div>

        <div className="relative hidden flex-1 max-w-md md:block">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search schools, states, admins…"
            className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>

          {showSearchDropdown && searchQuery && (
            <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl z-50 p-2 text-xs text-foreground divide-y divide-border">
              {!hasSearchResults ? (
                <div className="px-3 py-4 text-center text-muted-foreground">No matching results found</div>
              ) : (
                <>
                  {searchResults.states?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">States</p>
                      {searchResults.states.map(s => (
                        <button key={s.id} onClick={() => { navigate(s.route); setShowSearchDropdown(false); setSearchQuery(""); }} className="w-full text-left px-3 py-1.5 hover:bg-muted rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent">
                          <span className="font-semibold text-foreground">{s.name}</span>
                          <span className="text-[10px] text-muted-foreground">View details</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.admins?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Regional Admins</p>
                      {searchResults.admins.map(s => (
                        <button key={s.id} onClick={() => { navigate(s.route); setShowSearchDropdown(false); setSearchQuery(""); }} className="w-full text-left px-3 py-1.5 hover:bg-muted rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent">
                          <span className="font-semibold text-foreground">{s.name}</span>
                          <span className="text-[10px] text-muted-foreground">View profile</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.schools?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Schools</p>
                      {searchResults.schools.map(s => (
                        <button key={s.id} onClick={() => { navigate(s.route); setShowSearchDropdown(false); setSearchQuery(""); }} className="w-full text-left px-3 py-1.5 hover:bg-muted rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent">
                          <span className="font-semibold text-foreground">{s.name}</span>
                          <span className="text-[10px] text-muted-foreground">View details</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.media?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Media Approvals</p>
                      {searchResults.media.map(s => (
                        <button key={s.id} onClick={() => { navigate(s.route); setShowSearchDropdown(false); setSearchQuery(""); }} className="w-full text-left px-3 py-1.5 hover:bg-muted rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent">
                          <span className="font-semibold text-foreground truncate max-w-[200px]">{s.name}</span>
                          <span className="text-[10px] text-muted-foreground">Review Submission</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.rankings?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rankings</p>
                      {searchResults.rankings.map(s => (
                        <button key={s.id} onClick={() => { navigate(s.route); setShowSearchDropdown(false); setSearchQuery(""); }} className="w-full text-left px-3 py-1.5 hover:bg-muted rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent">
                          <span className="font-semibold text-foreground truncate max-w-[200px]">{s.name}</span>
                          <span className="text-[10px] text-muted-foreground">View Rankings</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.messages?.length > 0 && (
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Messages</p>
                      {searchResults.messages.map(s => (
                        <button key={s.id} onClick={() => { navigate(s.route); setShowSearchDropdown(false); setSearchQuery(""); }} className="w-full text-left px-3 py-1.5 hover:bg-muted rounded-lg flex justify-between items-center cursor-pointer border-0 bg-transparent">
                          <span className="font-semibold text-foreground truncate max-w-[200px]">{s.name}</span>
                          <span className="text-[10px] text-muted-foreground">Open Chats</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => navigate("/notifications")}
            className="relative rounded-lg border border-border bg-surface p-2 text-foreground hover:bg-muted cursor-pointer"
            aria-label="Notifications"
          >
            <HiOutlineBell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface py-1.5 pl-1.5 pr-3 hover:bg-muted cursor-pointer"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-[11px] font-semibold text-white">
                {userInitials}
              </span>
              <span className="hidden text-sm font-medium text-foreground sm:inline">{userFullName}</span>
              <HiChevronDown className="hidden h-4 w-4 text-muted-foreground sm:inline" />
            </button>

            {showProfileMenu && (
              <div 
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-surface shadow-xl z-50 p-1.5 text-xs text-foreground divide-y divide-border"
              >
                <div className="px-3 py-2">
                  <p className="font-semibold text-foreground">{userFullName}</p>
                  <p className="text-[10px] text-muted-foreground">{user?.email || ""}</p>
                </div>
                <div className="py-1 space-y-0.5">
                  <button 
                    onClick={() => { navigate("/settings"); setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-xl flex items-center gap-2 cursor-pointer border-0 bg-transparent text-foreground font-medium"
                  >
                    Account Details
                  </button>
                  <button 
                    onClick={() => { navigate("/settings"); setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-xl flex items-center gap-2 cursor-pointer border-0 bg-transparent text-foreground font-medium"
                  >
                    Settings
                  </button>
                  <button 
                    onClick={async () => {
                      setShowProfileMenu(false);
                      await logout();
                      navigate("/login", { replace: true });
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-muted text-rose-400 rounded-xl flex items-center gap-2 cursor-pointer border-0 bg-transparent font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

