import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const isAuthenticated = localStorage.getItem("authenticated") === "true";
  const userRole = localStorage.getItem("role");

  // If not authenticated, redirect to /
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If role is not allowed for this route, redirect to their home page
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === "regional") {
      return <Navigate to="/regional-admin" replace />;
    } else if (userRole === "school") {
      return <Navigate to="/school-admin" replace />;
    } else {
      return <Navigate to="/super-admin" replace />;
    }
  }

  return <Outlet />;
}
