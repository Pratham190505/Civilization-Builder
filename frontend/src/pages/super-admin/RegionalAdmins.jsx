<<<<<<< Updated upstream
import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlinePencilSquare, HiOutlineUserPlus, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { Card, CardHeader, StatusPill } from "../../components/common/Page.jsx";
import { regionalAdmins } from "../../data/adminData.js";
=======
import { useState, useEffect } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineTrash, HiOutlinePencilSquare, HiOutlineArrowRightOnRectangle, HiOutlineKey } from "react-icons/hi2";
import { Card, CardHeader, StatusPill } from "../../components/common/Page.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";
import { getRegionalAdmins, createRegionalAdmin, updateRegionalAdmin, deleteRegionalAdmin, resetPassword } from "../../api/security";
import { getStates } from "../../api/schools";
import { toast } from "sonner";
>>>>>>> Stashed changes

const getErrorMessage = (err, fallback) => err?.errors?.join(" • ") || err?.message || fallback;
const isStrongPassword = (value) => value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);

export default function RegionalAdmins() {
<<<<<<< Updated upstream
=======
  const { startImpersonation } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editStateId, setEditStateId] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");

  const loadData = async () => {
    try {
      setLoading(true);
      const [adminsRes, statesRes] = await Promise.all([getRegionalAdmins(), getStates()]);
      if (adminsRes.success) setAdmins(adminsRes.data || []);
      if (statesRes.success) setStates(statesRes.data || []);
    } catch {
      toast.error("Failed to load regional admins data from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!name || !email || !mobile || !selectedStateId || !password || !confirmPassword) {
      toast.error("Please fill all required fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!isStrongPassword(password)) {
      toast.error("Password must be at least 8 characters and include uppercase, lowercase, and a number");
      return;
    }
    try {
      const res = await createRegionalAdmin({
        full_name: name,
        email,
        mobile,
        stateId: Number(selectedStateId),
        password,
        confirmPassword
      });
      if (res.success) {
        toast.success("Regional Admin created successfully in database");
        setName("");
        setEmail("");
        setMobile("");
        setPassword("");
        setConfirmPassword("");
        setSelectedStateId("");
        setShowAddModal(false);
        loadData();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create regional admin"));
    }
  };

  const handleEditClick = (admin) => {
    setEditingAdminId(admin.id);
    setEditName(admin.name);
    setEditMobile(admin.mobile || "");
    setEditStateId(admin.stateId || "");
    setEditStatus(admin.status || "ACTIVE");
    setShowEditModal(true);
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    if (!editName || !editStateId) {
      toast.error("Please fill all required fields");
      return;
    }
    const parts = editName.trim().split(/\s+/);
    try {
      const res = await updateRegionalAdmin(editingAdminId, {
        first_name: parts[0],
        last_name: parts.slice(1).join(" "),
        mobile: editMobile,
        status: editStatus,
        stateId: Number(editStateId)
      });
      if (res.success) {
        toast.success("Regional Admin updated successfully");
        setShowEditModal(false);
        loadData();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update regional admin"));
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this regional admin user? This will remove all their scope mappings.")) return;
    try {
      const res = await deleteRegionalAdmin(id);
      if (res.success) {
        toast.success("Regional Admin deleted successfully from database");
        loadData();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete regional admin"));
    }
  };

  const handleLoginAs = async (admin) => {
    try {
      await startImpersonation(admin.id);
      window.location.href = "/regional-admin";
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to impersonate regional admin"));
    }
  };

  const handleResetPassword = async (admin) => {
    const newPassword = window.prompt(`Enter new password for ${admin.name}:`);
    if (newPassword === null) return;
    const confirmation = window.prompt("Confirm the new password:");
    if (confirmation === null) return;
    if (newPassword !== confirmation) {
      toast.error("Passwords do not match");
      return;
    }
    if (!isStrongPassword(newPassword)) {
      toast.error("Password must be at least 8 characters and include uppercase, lowercase, and a number");
      return;
    }
    try {
      const res = await resetPassword(admin.id, newPassword, confirmation);
      if (res.success) toast.success("Password reset successfully");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reset password"));
    }
  };

  const filteredAdmins = admins.filter((a) =>
    (a.name || "").toLowerCase().includes(q.toLowerCase()) ||
    (a.state || "").toLowerCase().includes(q.toLowerCase()) ||
    (a.email || "").toLowerCase().includes(q.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading Regional Admins...</p>
        </div>
      </div>
    );
  }

>>>>>>> Stashed changes
  return (
    <Card>
      <CardHeader
        title="Regional Admin Management"
        subtitle={`${regionalAdmins.length} regional admins across India`}
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
<<<<<<< Updated upstream
              <input placeholder="Search admin…" className="w-48 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20">
=======
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search admin…"
                className="w-48 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 cursor-pointer hover:opacity-90 border-0">
>>>>>>> Stashed changes
              <HiOutlinePlus className="h-3.5 w-3.5" /> Add Regional Admin
            </button>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 text-left">Admin</th>
              <th className="px-5 py-3 text-left">Assigned State</th>
              <th className="px-5 py-3 text-left">Schools Managed</th>
              <th className="px-5 py-3 text-left">Contact</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
<<<<<<< Updated upstream
            {regionalAdmins.map((a) => (
              <tr key={a.email} className="border-t border-border">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${a.color} text-xs font-semibold text-white`}>
                      {a.initials}
                    </span>
=======
            {filteredAdmins.length === 0 ? (
              <tr><td colSpan="5" className="px-5 py-8 text-center text-xs text-muted-foreground">No regional admins found in database.</td></tr>
            ) : filteredAdmins.map((a) => (
              <tr key={a.id} className="border-t border-border hover:bg-white/5 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">{a.initials}</span>
>>>>>>> Stashed changes
                    <span className="font-medium text-foreground">{a.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{a.state}</td>
<<<<<<< Updated upstream
                <td className="px-5 py-3 text-foreground">{a.schools}</td>
                <td className="px-5 py-3 text-muted-foreground">{a.email}</td>
                <td className="px-5 py-3"><StatusPill value={a.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <button className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-blue-300 hover:bg-primary/25">
                      <HiOutlineArrowRightOnRectangle className="h-3.5 w-3.5" /> Login As
                    </button>
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><HiOutlinePencilSquare className="h-4 w-4" /></button>
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><HiOutlineUserPlus className="h-4 w-4" /></button>
=======
                <td className="px-5 py-3 text-muted-foreground"><p className="text-foreground">{a.email}</p>{a.mobile && <p className="text-xs text-slate-500">{a.mobile}</p>}</td>
                <td className="px-5 py-3"><StatusPill value={a.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleLoginAs(a)} className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-blue-300 hover:bg-primary/25 cursor-pointer border-0">
                      <HiOutlineArrowRightOnRectangle className="h-3.5 w-3.5" /> Login As
                    </button>
                    <button onClick={() => handleResetPassword(a)} className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition cursor-pointer border-0" title="Reset Password"><HiOutlineKey className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleEditClick(a)} className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition cursor-pointer border-0" title="Edit Admin"><HiOutlinePencilSquare className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDeleteAdmin(a.id)} className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition cursor-pointer border-0" title="Delete Admin"><HiOutlineTrash className="h-3.5 w-3.5" /></button>
>>>>>>> Stashed changes
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
<<<<<<< Updated upstream
    </Card>
  );
}
=======

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-foreground">Add Regional Admin</h3>
            <p className="text-xs text-muted-foreground mt-1">This will register a new admin and assign their geographic state scope in the database</p>
            <form onSubmit={handleAddAdmin} className="mt-4 space-y-4">
              <Field label="Full Name" value={name} onChange={setName} placeholder="e.g. Meera Patel" />
              <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="e.g. meera@gds.in" />
              <Field label="Mobile Phone" value={mobile} onChange={setMobile} placeholder="e.g. 9988776655" />
              <div>
                <label className="text-xs text-muted-foreground">Assigned State</label>
                <select required value={selectedStateId} onChange={(e) => setSelectedStateId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="">Select Scoped State</option>
                  {states.map((st) => <option key={st.id} value={st.id}>{st.state_name} ({st.state_code})</option>)}
                </select>
              </div>
              <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Minimum 8 characters" />
              <Field label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm password" />
              <p className="text-[11px] text-muted-foreground">Use at least 8 characters with uppercase, lowercase, and a number.</p>
              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted cursor-pointer">Cancel</button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer border-0">Create Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Edit Regional Admin</h3>
            <p className="text-xs text-muted-foreground mt-1">Modify regional administrator account details and assigned state scope</p>
            <form onSubmit={handleEditAdmin} className="mt-4 space-y-4">
              <Field label="Admin Name" value={editName} onChange={setEditName} placeholder="e.g. Meera Patel" />
              <Field label="Mobile Phone" value={editMobile} onChange={setEditMobile} placeholder="e.g. 9988776655" />
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Assigned Geographic Scope (State)</label>
                <select required value={editStateId} onChange={(e) => setEditStateId(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="">Select Scoped State</option>
                  {states.map((st) => <option key={st.id} value={st.id}>{st.state_name} ({st.state_code})</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted cursor-pointer">Cancel</button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer border-0">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input required type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none" />
    </div>
  );
}
>>>>>>> Stashed changes
