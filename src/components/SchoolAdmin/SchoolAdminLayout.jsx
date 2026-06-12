import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import SchoolAdminSidebar from "./SchoolAdminSidebar.jsx";
import SchoolAdminNavbar from "./SchoolAdminNavbar.jsx";

export default function SchoolAdminLayout({ darkMode, onToggleDark }) {
  const location = useLocation();

  const pageMetadata = {
    "/school-admin": {
      title: "Dashboard",
      subtitle: "Welcome to School Admin Dashboard",
    },
    "/school-admin/schools": {
      title: "Schools",
      subtitle: "Manage your schools and institutions",
    },
    "/school-admin/districts": {
      title: "Districts",
      subtitle: "Manage districts and regional information",
    },
    "/school-admin/uploads": {
      title: "Uploads",
      subtitle: "Upload and manage media and content",
    },
    "/school-admin/media-approval": {
      title: "Media Approval",
      subtitle: "Review and approve media submissions",
    },
    "/school-admin/rankings": {
      title: "Rankings",
      subtitle: "View and manage school rankings and scores",
    },
    "/school-admin/notifications": {
      title: "Notifications",
      subtitle: "Manage your notifications",
    },
    "/school-admin/settings": {
      title: "Settings",
      subtitle: "Manage your preferences and settings",
    },
  };

  const currentPageMeta = pageMetadata[location.pathname] || pageMetadata["/school-admin"];

  // Determine active page from pathname
  const getActivePageId = () => {
    const pathParts = location.pathname.split("/");
    if (pathParts.length === 2) return "dashboard"; // /school-admin
    return pathParts[2]; // /school-admin/schools -> schools
  };

  const activePage = getActivePageId();

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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
