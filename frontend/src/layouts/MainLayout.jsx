import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Navbar from "../components/Navbar/Navbar.jsx";

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main column */}
      <div className="lg:pl-[260px]">
        <Navbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
