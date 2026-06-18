import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-[#0b0c10] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Loading Session...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to /
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If role is not allowed for this route, redirect to their home page
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "regional") {
      return <Navigate to="/regional-admin" replace />;
    } else if (role === "school") {
      return <Navigate to="/school-admin" replace />;
    } else {
      return <Navigate to="/super-admin" replace />;
    }
  }

  return <Outlet />;
}

