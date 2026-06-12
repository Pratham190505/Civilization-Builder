import { useState } from "react";
import SchoolAdminSidebar from "./SchoolAdminSidebar.jsx";
import SchoolAdminNavbar from "./SchoolAdminNavbar.jsx";
import SchoolAdminDashboard from "./SchoolAdminDashboard.jsx";

export default function SchoolAdminLayout({ darkMode, onToggleDark }) {
  const [activePage, setActivePage] = useState("dashboard");

  const pageMetadata = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Welcome to School Admin Dashboard",
    },
    schools: { title: "Schools", subtitle: "Manage your schools" },
    districts: { title: "Districts", subtitle: "District management" },
    uploads: { title: "Uploads", subtitle: "Upload media and content" },
    "media-approval": {
      title: "Media Approval",
      subtitle: "Review pending submissions",
    },
    rankings: { title: "Rankings", subtitle: "View school rankings" },
    reports: { title: "Reports", subtitle: "Analytics and reports" },
    recommendations: { title: "Recommendations", subtitle: "System suggestions" },
    notifications: { title: "Notifications", subtitle: "Your notifications" },
    settings: { title: "Settings", subtitle: "Manage your preferences" },
  };

  const currentPageMeta =
    pageMetadata[activePage] || pageMetadata.dashboard;

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: darkMode ? "#0b0f1c" : "#f3f7fd",
      }}
    >
      {/* Sidebar */}
      <SchoolAdminSidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        darkMode={darkMode}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-60">
        <SchoolAdminNavbar
          title={currentPageMeta.title}
          subtitle={currentPageMeta.subtitle}
          darkMode={darkMode}
          onToggleDark={onToggleDark}
        />

        <main className="px-4 py-5 sm:px-6 lg:px-8">
          {activePage === "dashboard" && (
            <SchoolAdminDashboard
              darkMode={darkMode}
              onNavigate={handleNavigate}
            />
          )}
          {activePage !== "dashboard" && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: darkMode
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.02)",
              }}
            >
              <p
                className="text-lg font-semibold"
                style={{
                  color: darkMode ? "#e2e8f0" : "#0f172a",
                }}
              >
                {currentPageMeta.title} Page
              </p>
              <p
                className="text-sm mt-2"
                style={{
                  color: darkMode ? "#8892a4" : "#64748b",
                }}
              >
                {currentPageMeta.subtitle}
              </p>
              <p
                className="text-xs mt-4"
                style={{
                  color: darkMode ? "#8892a4" : "#94a3b8",
                }}
              >
                This section is available for future expansion.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
