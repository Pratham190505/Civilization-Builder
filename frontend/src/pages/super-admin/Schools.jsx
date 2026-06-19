import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineArrowRightOnRectangle, HiOutlineEye, HiCheck, HiXMark } from "react-icons/hi2";
import { Card, CardHeader, Tier, StatusPill } from "../../components/common/Page.jsx";
import { getSchools, approveSchool, rejectSchool } from "../../api/schools";
import { useAuth } from "../../hooks/useAuth.jsx";
import { toast } from "sonner";

export default function Schools() {
  const navigate = useNavigate();
  const { startImpersonation } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadData = async () => {
    try {
      const schoolsRes = await getSchools();
      if (schoolsRes.success) setSchools(schoolsRes.data);
    } catch (err) {
      toast.error("Failed to load schools metadata");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await approveSchool(id, "Onboarding criteria verified and approved.");
      if (res.success) {
        toast.success("School onboarding request approved successfully!");
        loadData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to approve school");
    }
  };

  const handleReject = async (id) => {
    const comments = window.prompt("Enter reason for onboarding rejection:");
    if (comments === null) return; // cancel click
    try {
      const res = await rejectSchool(id, comments || "Criteria verification failed.");
      if (res.success) {
        toast.success("School onboarding request rejected.");
        loadData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to reject school");
    }
  };



  // Login as School Admin (impersonation lookup mapping)
  const handleLoginAs = async (school) => {
    try {
      const mapping = school.SchoolAdminMappings?.[0];
      const adminUserId = mapping?.user_id || mapping?.User?.id;
      if (!adminUserId) {
        toast.error("No School Admin mapped to this school yet in the database.");
        return;
      }
      await startImpersonation(adminUserId);
      window.location.href = "/school-admin";
    } catch (err) {
      toast.error("Impersonation failed: " + err.message);
    }
  };

  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      (s.school_name || "").toLowerCase().includes(q.toLowerCase()) ||
      (s.school_code || "").toLowerCase().includes(q.toLowerCase());

    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && s.status === statusFilter.toUpperCase();
  });



  return (
    <Card>
      <CardHeader
        title="School Management"
        subtitle={`${schools.length} schools across India`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate("/schools/add")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg cursor-pointer hover:opacity-90"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" /> Add School
            </button>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
              {["All", "Pending", "Approved", "Rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    statusFilter === f ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search school…"
                className="w-48 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 text-left">School Name</th>
              <th className="px-5 py-3 text-left">Code</th>
              <th className="px-5 py-3 text-left">State</th>
              <th className="px-5 py-3 text-left">District/City</th>
              <th className="px-5 py-3 text-left">Principal</th>
              <th className="px-5 py-3 text-left">Students/Teachers</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchools.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-white/5 transition">
                <td className="px-5 py-3 font-medium text-foreground">{s.school_name}</td>
                <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{s.school_code}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {s.District?.State?.state_name || s.District?.State?.name || "N/A"}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{s.District?.district_name || "N/A"}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.principal_name || "N/A"}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {s.student_count} S / {s.teacher_count} T
                </td>
                <td className="px-5 py-3">
                  <StatusPill value={s.status} />
                </td>
                <td className="px-5 py-3 text-center">
                  <div className="flex justify-center items-center gap-1.5">
                    {s.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleApprove(s.id)}
                          className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition cursor-pointer animate-pulse"
                          title="Approve School"
                        >
                          <HiCheck className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(s.id)}
                          className="inline-flex items-center gap-0.5 rounded-md bg-rose-500/15 px-2 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/25 transition cursor-pointer"
                          title="Reject School"
                        >
                          <HiXMark className="h-3.5 w-3.5" /> Reject
                        </button>
                      </>
                    )}
                    {s.status === "APPROVED" && (
                      <button
                        onClick={() => handleLoginAs(s)}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-blue-300 hover:bg-primary/25 cursor-pointer"
                      >
                        <HiOutlineArrowRightOnRectangle className="h-3.5 w-3.5" /> Login As
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
