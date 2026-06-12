import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import Dashboard from "../pages/super-admin/Dashboard.jsx";
import Login from "../pages/auth/Login.jsx";
import Signup from "../pages/auth/Signup.jsx";
import IndiaMap from "../pages/super-admin/IndiaMap.jsx";
import States from "../pages/super-admin/States.jsx";
import RegionalAdmins from "../pages/super-admin/RegionalAdmins.jsx";
import Schools from "../pages/super-admin/Schools.jsx";
import MediaApprovals from "../pages/super-admin/MediaApprovals.jsx";
import Rankings from "../pages/super-admin/Rankings.jsx";
import Analytics from "../pages/super-admin/Analytics.jsx";
import Notifications from "../pages/super-admin/Notifications.jsx";
import Messages from "../pages/super-admin/Messages.jsx";
import Permissions from "../pages/super-admin/Permissions.jsx";
import AuditLogs from "../pages/super-admin/AuditLogs.jsx";
import Settings from "../pages/super-admin/Settings.jsx";
import Placeholder from "../pages/Placeholder.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/india-map" element={<IndiaMap />} />
        <Route path="/states" element={<States />} />
        <Route path="/regional-admins" element={<RegionalAdmins />} />
        <Route path="/schools" element={<Schools />} />
        <Route path="/media-approvals" element={<MediaApprovals />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/reports" element={<Analytics />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/users-roles" element={<Permissions />} />
        <Route path="/activity-logs" element={<AuditLogs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Placeholder title="Not Found" />} />
      </Route>
    </Routes>
  );
}
