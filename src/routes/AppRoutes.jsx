import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Placeholder from "../pages/Placeholder.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/india-map" element={<Placeholder title="India Map" />} />
        <Route path="/states" element={<Placeholder title="States" />} />
        <Route path="/regional-admins" element={<Placeholder title="Regional Admins" />} />
        <Route path="/schools" element={<Placeholder title="Schools" />} />
        <Route path="/media-approvals" element={<Placeholder title="Media Approvals" />} />
        <Route path="/rankings" element={<Placeholder title="Rankings" />} />
        <Route path="/reports" element={<Placeholder title="Reports & Analytics" />} />
        <Route path="/notifications" element={<Placeholder title="Notifications" />} />
        <Route path="/messages" element={<Placeholder title="Messages" />} />
        <Route path="/users-roles" element={<Placeholder title="Users & Roles" />} />
        <Route path="/activity-logs" element={<Placeholder title="Activity Logs" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
        <Route path="*" element={<Placeholder title="Not Found" />} />
      </Route>
    </Routes>
  );
}
