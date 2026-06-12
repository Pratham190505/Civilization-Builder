import { HiOutlineBolt } from "react-icons/hi2";
import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 py-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/30">
            <HiOutlineBolt className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">GDS Control Hub</p>
            <p className="text-[10px] font-medium tracking-[0.15em] text-muted-foreground">
              ADMIN PORTAL
            </p>
          </div>
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
