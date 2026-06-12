import { Outlet, Link } from "react-router-dom";
import Logo from "../components/Navbar/Logo.jsx";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070b19] flex items-center justify-center p-4">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.24),rgba(255,255,255,0))]" />
      
      {/* Floating blur circles */}
      <div 
        className="pointer-events-none absolute h-[500px] w-[500px] rounded-full blur-[120px] opacity-40 animate-pulse" 
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, #6366f1 100%)",
          top: "-10%",
          left: "-10%",
          animationDuration: "8s",
        }}
      />
      <div 
        className="pointer-events-none absolute h-[400px] w-[400px] rounded-full blur-[100px] opacity-30 animate-pulse" 
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, #ec4899 100%)",
          bottom: "-5%",
          right: "-5%",
          animationDuration: "12s",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] flex flex-col gap-6">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo maxWidth="180px" />
          </Link>
        </div>

        <div className="w-full">
          <Outlet />
        </div>

        <p className="text-center text-[10px] tracking-wider uppercase text-slate-500 font-medium">
          © 2026 Global Discovery Schools · All rights reserved
        </p>
      </div>
    </div>
  );
}
