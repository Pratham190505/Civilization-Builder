import { Outlet, Link } from "react-router-dom";
import Logo from "../components/Navbar/Logo.jsx";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 py-10">
        <Link to="/" className="flex items-center gap-2">
          <Logo maxWidth="140px" />
        </Link>

        <div className="flex flex-1 items-center">
          <div className="w-full">
            <Outlet />
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          © 2026 Global Discovery Schools · All rights reserved
        </p>
      </div>
    </div>
  );
}
