import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineBuildingOffice2 } from "react-icons/hi2";
import RoleSelect from "../../components/Auth/RoleSelect.jsx";

export default function Signup() {
  const [role, setRole] = useState("regional");
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
      <h2 className="text-xl font-semibold text-foreground">Create your account</h2>
      <p className="mt-1 text-sm text-muted-foreground">Join the GDS Control Hub network</p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <RoleSelect value={role} onChange={setRole} />

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Full name</label>
          <div className="relative mt-1">
            <HiOutlineUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input required placeholder="Anurag Mehta" className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {role === "school" ? "School name" : role === "regional" ? "Assigned state" : "Organization"}
          </label>
          <div className="relative mt-1">
            <HiOutlineBuildingOffice2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input required placeholder={role === "school" ? "GDS Pune" : "Maharashtra"} className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Email</label>
          <div className="relative mt-1">
            <HiOutlineEnvelope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="email" required placeholder="you@gds.in" className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Password</label>
          <div className="relative mt-1">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="password" required placeholder="At least 8 characters" className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
          </div>
        </div>

        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-border bg-background" />
          I agree to the GDS Admin Terms of Service and Privacy Policy.
        </label>

        <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:opacity-90">
          Create account
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
