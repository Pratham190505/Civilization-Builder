import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../hooks/useTheme.jsx";
import RegionalAdminSidebar from "../components/RegionalAdmin/RegionalAdminSidebar.jsx";
import RegionalAdminNavbar from "../components/RegionalAdmin/RegionalAdminNavbar.jsx";
import RegionalAdminPageHeader from "../components/RegionalAdmin/RegionalAdminPageHeader.jsx";

const pageMetadata = {
  "/regional-admin": {
    id: "dashboard",
    title: "Dashboard",
    subtitle: "Gujarat State Overview",
  },
  "/regional-admin/schools": {
    id: "schools",
    title: "Schools",
    subtitle: "School directory and management",
  },
  "/regional-admin/add-school": {
    id: "add-school",
    title: "Add School",
    subtitle: "Register a new school",
  },
  "/regional-admin/videos": {
    id: "videos",
    title: "Videos & Media",
    subtitle: "Upload and manage approved content",
  },
  "/regional-admin/districts": {
    id: "districts",
    title: "Districts",
    subtitle: "District management",
  },
  "/regional-admin/add-district": {
    id: "add-district",
    title: "Add District",
    subtitle: "Register a new district",
  },
  "/regional-admin/rankings": {
    id: "rankings",
    title: "Rankings",
    subtitle: "School performance rankings (view only)",
  },
  "/regional-admin/inspections": {
    id: "inspections",
    title: "Inspection Reports",
    subtitle: "Manage inspection requests and reports",
  },
  "/regional-admin/settings": {
    id: "settings",
    title: "Settings",
    subtitle: "Account and application preferences",
  },
};

export default function RegionalAdminLayout() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const darkMode = theme === "dark";

  // Find metadata for current route
  const currentPath = location.pathname;
  const currentPageMeta = pageMetadata[currentPath] || pageMetadata["/regional-admin"];
  const activePageId = currentPageMeta.id;

  return (
    <div
      className={`w-full h-screen flex overflow-hidden regional-admin-theme ${darkMode ? "dark" : ""}`}
      style={{ background: "var(--app-bg)" }}
    >
      {/* Background Decorative Blur Bubbles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 480,
            height: 480,
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.18), transparent)",
            top: "-8%",
            right: "8%",
            opacity: darkMode ? 1 : 0.4,
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 360,
            height: 360,
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.14), transparent)",
            bottom: "8%",
            left: "4%",
            opacity: darkMode ? 1 : 0.3,
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.1), transparent)",
            bottom: "28%",
            right: "18%",
            opacity: darkMode ? 1 : 0.25,
          }}
        />
      </div>

      {/* Sidebar navigation */}
      <div style={{ position: "relative", zIndex: 20 }}>
        <RegionalAdminSidebar />
      </div>

      {/* Main columns */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ position: "relative", zIndex: 10 }}>
        <RegionalAdminNavbar darkMode={darkMode} onToggleDark={toggle} />
        
        <RegionalAdminPageHeader
          title={currentPageMeta.title}
          subtitle={currentPageMeta.subtitle}
          page={activePageId}
        />

        {/* Page rendering main outline */}
        <main className="flex-1 min-h-0 overflow-auto relative p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
