import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import Dashboard from "../pages/super-admin/Dashboard.jsx";
import Login from "../pages/auth/Login.jsx";
import IndiaMap from "../pages/super-admin/IndiaMap.jsx";
import States from "../pages/super-admin/States.jsx";
import Districts from "../pages/super-admin/Districts.jsx";
import RegionalAdmins from "../pages/super-admin/RegionalAdmins.jsx";
import Schools from "../pages/super-admin/Schools.jsx";
import SuperAdminAddSchool from "../pages/super-admin/AddSchool.jsx";
import MediaApprovals from "../pages/super-admin/MediaApprovals.jsx";
import Rankings from "../pages/super-admin/Rankings.jsx";
import Analytics from "../pages/super-admin/Analytics.jsx";
import Notifications from "../pages/super-admin/Notifications.jsx";
import Messages from "../pages/super-admin/Messages.jsx";
import Permissions from "../pages/super-admin/Permissions.jsx";
import AuditLogs from "../pages/super-admin/AuditLogs.jsx";
import Settings from "../pages/super-admin/Settings.jsx";
import Placeholder from "../pages/Placeholder.jsx";
import SchoolAdmin from "../pages/SchoolAdmin/SchoolAdmin.jsx";
import SchoolAdminDashboard from "../pages/SchoolAdmin/Dashboard.jsx";
import SchoolAdminSchools from "../pages/SchoolAdmin/Schools.jsx";
import SchoolAdminDistricts from "../pages/SchoolAdmin/Districts.jsx";
import SchoolAdminUploads from "../pages/SchoolAdmin/Uploads.jsx";
import SchoolAdminMediaApproval from "../pages/SchoolAdmin/MediaApproval.jsx";
import SchoolAdminRankings from "../pages/SchoolAdmin/Rankings.jsx";
import SchoolAdminNotifications from "../pages/SchoolAdmin/Notifications.jsx";
import SchoolAdminSettings from "../pages/SchoolAdmin/Settings.jsx";

import SuperAdminInspections from "../pages/super-admin/Inspections.jsx";

// Regional Admin Layout & Pages
import RegionalAdminLayout from "../layouts/RegionalAdminLayout.jsx";
import RegionalAdminDashboard from "../pages/regional-admin/Dashboard.jsx";
import RegionalAdminSchools from "../pages/regional-admin/Schools.jsx";
import RegionalAdminAddSchool from "../pages/regional-admin/AddSchool.jsx";
import RegionalAdminDistricts from "../pages/regional-admin/Districts.jsx";
import RegionalAdminAddDistrict from "../pages/regional-admin/AddDistrict.jsx";
import RegionalAdminVideos from "../pages/regional-admin/Videos.jsx";
import RegionalAdminRankings from "../pages/regional-admin/Rankings.jsx";
import RegionalAdminInspections from "../pages/regional-admin/Inspections.jsx";
import RegionalAdminSettings from "../pages/regional-admin/Settings.jsx";

// Authentication Route Guard
import ProtectedRoute from "./ProtectedRoute.jsx";
import { useAuth } from "../hooks/useAuth.jsx";

function RootRedirect() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Loading Session...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (role === "regional") {
      return <Navigate to="/regional-admin" replace />;
    } else if (role === "school") {
      return <Navigate to="/school-admin" replace />;
    } else {
      return <Navigate to="/super-admin" replace />;
    }
  }

  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root Route Redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["super"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/super-admin" element={<Dashboard />} />
          <Route path="/india-map" element={<IndiaMap />} />
          <Route path="/states" element={<States />} />
          <Route path="/districts" element={<Districts />} />
          <Route path="/regional-admins" element={<RegionalAdmins />} />
          <Route path="/schools" element={<Schools />} />
          <Route path="/schools/add" element={<SuperAdminAddSchool />} />
          <Route path="/media-approvals" element={<MediaApprovals />} />
          <Route path="/inspections" element={<SuperAdminInspections />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/reports" element={<Analytics />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/users-roles" element={<Permissions />} />
          <Route path="/activity-logs" element={<AuditLogs />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* School Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["school"]} />}>
        <Route path="/school-admin" element={<SchoolAdmin />}>
          <Route index element={<SchoolAdminDashboard />} />
          <Route path="schools" element={<SchoolAdminSchools />} />
          <Route path="districts" element={<SchoolAdminDistricts />} />
          <Route path="uploads" element={<SchoolAdminUploads />} />
          <Route path="media-approval" element={<SchoolAdminMediaApproval />} />
          <Route path="rankings" element={<SchoolAdminRankings />} />
          <Route path="notifications" element={<SchoolAdminNotifications />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<SchoolAdminSettings />} />
        </Route>
      </Route>

      {/* Regional Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["regional"]} />}>
        <Route path="/regional-admin" element={<RegionalAdminLayout />}>
          <Route index element={<RegionalAdminDashboard />} />
          <Route path="schools" element={<RegionalAdminSchools />} />
          <Route path="add-school" element={<RegionalAdminAddSchool />} />
          <Route path="districts" element={<RegionalAdminDistricts />} />
          <Route path="add-district" element={<RegionalAdminAddDistrict />} />
          <Route path="videos" element={<RegionalAdminVideos />} />
          <Route path="rankings" element={<RegionalAdminRankings />} />
          <Route path="inspections" element={<RegionalAdminInspections />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<RegionalAdminSettings />} />
        </Route>
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Placeholder title="Not Found" />} />
    </Routes>
  );
}
