import { useState, useEffect } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineArrowRightOnRectangle, HiOutlineEye, HiCheck, HiXMark } from "react-icons/hi2";
import { Card, CardHeader, Tier, StatusPill } from "../../components/common/Page.jsx";
import { getSchools, createSchool, approveSchool, rejectSchool, getDistricts, getStates } from "../../api/schools";
import { useAuth } from "../../hooks/useAuth.jsx";
import { toast } from "sonner";

export default function Schools() {
  const { startImpersonation } = useAuth();
  const [schools, setSchools] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Onboarding creation form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [udiseCode, setUdiseCode] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [schoolMobile, setSchoolMobile] = useState("");
  const [address, setAddress] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);

  const loadData = async () => {
    try {
      const schoolsRes = await getSchools();
      const districtsRes = await getDistricts();
      const statesRes = await getStates();
      if (schoolsRes.success) setSchools(schoolsRes.data);
      if (districtsRes.success) setDistricts(districtsRes.data);
      if (statesRes.success) setStates(statesRes.data);
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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedDistrictId) {
      toast.error("Please select a district");
      return;
    }
    try {
      const payload = {
        district_id: parseInt(selectedDistrictId, 10),
        school_name: schoolName,
        school_code: schoolCode,
        udise_code: udiseCode,
        principal_name: principalName,
        email: schoolEmail,
        mobile: schoolMobile,
        address,
        student_count: parseInt(studentCount || "0", 10),
        teacher_count: parseInt(teacherCount || "0", 10),
        media_upload_enabled: 1,
      };

      const res = await createSchool(payload);
      if (res.success) {
        toast.success("School registration submitted. Pending approval.");
        setShowAddModal(false);
        // Clear fields
        setSchoolName("");
        setSchoolCode("");
        setUdiseCode("");
        setPrincipalName("");
        setSchoolEmail("");
        setSchoolMobile("");
        setAddress("");
        setSelectedStateId("");
        setSelectedDistrictId("");
        loadData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit school onboarding");
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

  const filteredDistricts = districts.filter(
    (d) => !selectedStateId || d.state_id === parseInt(selectedStateId, 10)
  );

  return (
    <Card>
      <CardHeader
        title="School Management"
        subtitle={`${schools.length} schools across India`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
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

      {/* Register / Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <h3 className="text-lg font-semibold text-foreground">Submit School Registration</h3>
            <form onSubmit={handleRegister} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">School Name</label>
                  <input
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. GDS Pune"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">School Code</label>
                  <input
                    required
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    placeholder="e.g. GDS-PN-02"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">State</label>
                  <select
                    required
                    value={selectedStateId}
                    onChange={(e) => {
                      setSelectedStateId(e.target.value);
                      setSelectedDistrictId("");
                    }}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  >
                    <option value="">Select State</option>
                    {states.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.state_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">District</label>
                  <select
                    required
                    value={selectedDistrictId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                    disabled={!selectedStateId}
                  >
                    <option value="">Select District</option>
                    {filteredDistricts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.district_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Principal Name</label>
                  <input
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    placeholder="Dr. Arjun Sen"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">UDISE Code</label>
                  <input
                    value={udiseCode}
                    onChange={(e) => setUdiseCode(e.target.value)}
                    placeholder="27251308302"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Principal Email</label>
                  <input
                    type="email"
                    value={schoolEmail}
                    onChange={(e) => setSchoolEmail(e.target.value)}
                    placeholder="principal@gds-school.in"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Principal Phone</label>
                  <input
                    value={schoolMobile}
                    onChange={(e) => setSchoolMobile(e.target.value)}
                    placeholder="9988776655"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Student Count</label>
                  <input
                    type="number"
                    value={studentCount}
                    onChange={(e) => setStudentCount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Teacher Count</label>
                  <input
                    type="number"
                    value={teacherCount}
                    onChange={(e) => setTeacherCount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">School Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street details..."
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer"
                >
                  Submit Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
