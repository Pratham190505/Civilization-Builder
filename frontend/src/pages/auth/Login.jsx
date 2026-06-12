import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEnvelope, HiOutlineLockClosed, HiEye, HiEyeSlash } from "react-icons/hi2";
import { motion } from "framer-motion";
import RoleSelect from "../../components/Auth/RoleSelect.jsx";

export default function Login() {
  const [role, setRole] = useState("super");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Redirect on mount if already authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem("authenticated") === "true";
    const userRole = localStorage.getItem("role");
    if (isAuth && userRole) {
      if (userRole === "regional") {
        navigate("/regional-admin", { replace: true });
      } else if (userRole === "school") {
        navigate("/school-admin", { replace: true });
      } else {
        navigate("/super-admin", { replace: true });
      }
    }
  }, [navigate]);

  const submit = (e) => {
    e.preventDefault();
    localStorage.setItem("authenticated", "true");
    localStorage.setItem("role", role);
    if (role === "regional") {
      navigate("/regional-admin");
    } else if (role === "school") {
      navigate("/school-admin");
    } else {
      navigate("/super-admin");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-white/20"
      style={{
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Decorative Glow Dots */}
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-violet-600/20 blur-xl pointer-events-none" />

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Sign in to your GDS Control Hub account
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Role Selector */}
        <div>
          <RoleSelect value={role} onChange={setRole} />
        </div>

        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Email Address
          </label>
          <div className="relative">
            <HiOutlineEnvelope className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gds.in"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Password
            </label>
            <button
              type="button"
              className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-all"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <HiEyeSlash className="h-4.5 w-4.5" /> : <HiEye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Remember Me Toggle */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500/30"
            />
            Remember me
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
        >
          Sign In to GDS Hub
        </motion.button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-400">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
