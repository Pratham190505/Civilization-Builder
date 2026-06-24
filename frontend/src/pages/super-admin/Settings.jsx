import { useState, useEffect } from "react";
import { Card, CardHeader } from "../../components/common/Page.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";
import { updateProfile, changePassword } from "../../api/auth";
import { toast } from "sonner";

export default function Settings() {
  const { user, loading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem("notifs_super_admin");
    return saved ? JSON.parse(saved) : { email: true, push: true, weekly: true };
  });

  useEffect(() => {
    localStorage.setItem("notifs_super_admin", JSON.stringify(notifs));
  }, [notifs]);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setMobile(user.mobile || "");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-transparent text-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        mobile: mobile,
      });
      if (res.success) {
        toast.success("Profile updated successfully!");
        // Optionally update the context user if needed (the user will refresh on reload or if context handles it)
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Error updating profile");
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.message || "Failed to change password");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Error changing password");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="Account Profile" subtitle="Your personal details" />
        <form onSubmit={handleSaveProfile} className="space-y-4 p-5 pt-0">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Mobile Phone</label>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground opacity-70 cursor-not-allowed focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Role</label>
            <input
              value={user?.roles?.join(", ") || "SUPER_ADMIN"}
              disabled
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground opacity-70 cursor-not-allowed focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-lg bg-linear-to-r from-blue-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 cursor-pointer border-0">Save changes</button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Security" subtitle="Update your account password" />
        <form onSubmit={handleChangePasswordSubmit} className="space-y-4 p-5 pt-0">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-lg bg-linear-to-r from-blue-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 cursor-pointer border-0">Update Password</button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Preferences" subtitle="Customize how the hub looks and behaves" />
        <div className="space-y-4 p-5 pt-0">
          {[
            { key: "email", label: "Email notifications" },
            { key: "push", label: "Push notifications" },
            { key: "weekly", label: "Weekly digest" }
          ].map((p) => (
            <div key={p.key} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-sm">
              <p className="font-medium text-foreground">{p.label}</p>
              <input
                type="checkbox"
                checked={notifs[p.key] || false}
                onChange={(e) => setNotifs(prev => ({ ...prev, [p.key]: e.target.checked }))}
                className="h-4 w-4 rounded border-border bg-background cursor-pointer"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

