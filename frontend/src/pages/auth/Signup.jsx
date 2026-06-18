import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlinePhone } from "react-icons/hi2";
import { signup } from "../../api/auth";
import { toast } from "sonner";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim() || form.full_name.trim().length < 2)
      errs.full_name = "Full name is required (min 2 chars)";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Valid email address is required";
    if (!form.mobile || form.mobile.length < 7)
      errs.mobile = "Valid mobile number is required";
    if (!form.password || form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (!/[a-z]/.test(form.password)) errs.password = "Password must include a lowercase letter";
    if (!/[A-Z]/.test(form.password)) errs.password = "Password must include an uppercase letter";
    if (!/\d/.test(form.password)) errs.password = "Password must include a number";
    if (form.password !== form.confirm_password)
      errs.confirm_password = "Passwords do not match";
    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);
      const res = await signup({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
      });

      if (res.success) {
        toast.success("Account created! You can now log in.");
        navigate("/login");
      } else {
        toast.error(res.message || "Failed to create account");
      }
    } catch (err) {
      const msg =
        err?.message ||
        (Array.isArray(err?.errors) ? err.errors[0] : null) ||
        "Failed to create account. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = "text", placeholder, icon: Icon }) => (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </label>
      <div className="relative mt-1">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name={name}
          type={type}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required
          className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
          style={{ borderColor: errors[name] ? "#ef4444" : undefined }}
        />
      </div>
      {errors[name] && (
        <p className="mt-1 text-[11px] text-red-500">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
      <h2 className="text-xl font-semibold text-foreground">Create your account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Join the GDS Control Hub network — role assigned as School Admin by default
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <Field
          label="Full Name"
          name="full_name"
          placeholder="Anurag Mehta"
          icon={HiOutlineUser}
        />
        <Field
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@gds.in"
          icon={HiOutlineEnvelope}
        />
        <Field
          label="Mobile Number"
          name="mobile"
          type="tel"
          placeholder="9876543210"
          icon={HiOutlinePhone}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="Min 8 chars with upper, lower & number"
          icon={HiOutlineLockClosed}
        />
        <Field
          label="Confirm Password"
          name="confirm_password"
          type="password"
          placeholder="Re-enter your password"
          icon={HiOutlineLockClosed}
        />

        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-border bg-background"
          />
          I agree to the GDS Admin Terms of Service and Privacy Policy.
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:opacity-90 disabled:opacity-60 cursor-pointer border-0"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
