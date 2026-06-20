import { useState, useEffect } from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiCheck, HiXMark } from "react-icons/hi2";
import { Card, CardHeader, StatusPill } from "../../components/common/Page.jsx";
import { getStates, getDistricts, createDistrict, updateDistrict, deleteDistrict, getSchools } from "../../api/schools";
import { toast } from "sonner";

export default function Districts() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals Control
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Form Fields
  const [districtName, setDistrictName] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [statesRes, districtsRes, schoolsRes] = await Promise.all([
        getStates(),
        getDistricts(),
        getSchools()
      ]);
      if (statesRes.success) setStates(statesRes.data || []);
      if (districtsRes.success) setDistricts(districtsRes.data || []);
      if (schoolsRes.success) setSchools(schoolsRes.data || []);
    } catch (err) {
      toast.error("Failed to load geographic and school data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!districtName || !districtCode || !selectedStateId) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const res = await createDistrict({
        state_id: parseInt(selectedStateId, 10),
        district_name: districtName.trim(),
        district_code: districtCode.trim().toUpperCase(),
        is_active: 1
      });

      if (res.success) {
        toast.success("District created successfully");
        setShowAddModal(false);
        setDistrictName("");
        setDistrictCode("");
        setSelectedStateId("");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to create district");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!districtName || !districtCode || !selectedStateId) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const res = await updateDistrict(selectedDistrict.id, {
        state_id: parseInt(selectedStateId, 10),
        district_name: districtName.trim(),
        district_code: districtCode.trim().toUpperCase(),
        is_active: selectedDistrict.is_active
      });

      if (res.success) {
        toast.success("District updated successfully");
        setShowEditModal(false);
        setSelectedDistrict(null);
        setDistrictName("");
        setDistrictCode("");
        setSelectedStateId("");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update district");
    }
  };

  const handleToggleActive = async (district) => {
    const nextStatus = district.is_active ? 0 : 1;
    const actionLabel = nextStatus ? "activate" : "deactivate";
    
    try {
      const res = await updateDistrict(district.id, {
        state_id: district.state_id,
        district_name: district.district_name,
        district_code: district.district_code,
        is_active: nextStatus
      });

      if (res.success) {
        toast.success(`District ${actionLabel}d successfully`);
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || `Failed to ${actionLabel} district`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this district? All associated schools might be affected.")) return;
    try {
      const res = await deleteDistrict(id);
      if (res.success) {
        toast.success("District deleted successfully");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete district");
    }
  };

  const openEditModal = (dist) => {
    setSelectedDistrict(dist);
    setDistrictName(dist.district_name);
    setDistrictCode(dist.district_code);
    setSelectedStateId(String(dist.state_id));
    setShowEditModal(true);
  };

  // Aggregate stats per district
  const aggregatedRows = districts.map((d) => {
    const districtSchools = schools.filter((s) => s.district_id === d.id);
    const active = districtSchools.filter((s) => s.status === "APPROVED").length;
    
    return {
      ...d,
      totalSchools: districtSchools.length,
      activeSchools: active,
      stateName: d.State?.state_name || "N/A"
    };
  });

  const filteredRows = aggregatedRows.filter((r) => {
    const matchesSearch =
      r.district_name.toLowerCase().includes(q.toLowerCase()) ||
      r.district_code.toLowerCase().includes(q.toLowerCase());

    const matchesState = stateFilter === "All" || String(r.state_id) === stateFilter;
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && r.is_active === 1) ||
      (statusFilter === "Inactive" && r.is_active === 0);

    return matchesSearch && matchesState && matchesStatus;
  });

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading District Management...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader
        title="District Management"
        subtitle={`${districts.length} districts registered across India`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg cursor-pointer hover:opacity-90"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" /> Add District
            </button>
            
            {/* Filter by State */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="All">All States</option>
              {states.map((st) => (
                <option key={st.id} value={String(st.id)}>
                  {st.state_name}
                </option>
              ))}
            </select>

            {/* Filter by Status */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
              {["All", "Active", "Inactive"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer border-0 ${
                    statusFilter === f ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search district…"
                className="w-44 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        }
      />
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-5 py-3 text-left">District Name</th>
              <th className="px-5 py-3 text-left">District Code</th>
              <th className="px-5 py-3 text-left">Assigned State</th>
              <th className="px-5 py-3 text-left">Total Schools</th>
              <th className="px-5 py-3 text-left">Active Schools</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-8 text-center text-xs text-muted-foreground">
                  No districts found.
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-white/5 transition">
                  <td className="px-5 py-3 font-medium text-foreground">{r.district_name}</td>
                  <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{r.district_code}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.stateName}</td>
                  <td className="px-5 py-3 text-foreground">{r.totalSchools}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                      {r.activeSchools}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill value={r.is_active ? "ACTIVE" : "INACTIVE"} />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(r)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border-0 cursor-pointer transition ${
                          r.is_active
                            ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                        title={r.is_active ? "Deactivate District" : "Activate District"}
                      >
                        {r.is_active ? <HiXMark className="w-3.5 h-3.5" /> : <HiCheck className="w-3.5 h-3.5" />}
                        {r.is_active ? "Deactivate" : "Activate"}
                      </button>
                      
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition cursor-pointer border-0"
                        title="Edit District"
                      >
                        <HiOutlinePencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition cursor-pointer border-0"
                        title="Delete District"
                      >
                        <HiOutlineTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add District Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Add New District</h3>
            <form onSubmit={handleAdd} className="mt-4 space-y-4 text-left">
              <div>
                <label className="text-xs text-muted-foreground">Select State</label>
                <select
                  required
                  value={selectedStateId}
                  onChange={(e) => setSelectedStateId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="">Select State</option>
                  {states.map((st) => (
                    <option key={st.id} value={String(st.id)}>
                      {st.state_name} ({st.state_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">District Name</label>
                <input
                  required
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  placeholder="e.g. Pune"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">District Code</label>
                <input
                  required
                  value={districtCode}
                  onChange={(e) => setDistrictCode(e.target.value)}
                  placeholder="e.g. PUN"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setDistrictName("");
                    setDistrictCode("");
                    setSelectedStateId("");
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer border-0"
                >
                  Add District
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit District Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Edit District Details</h3>
            <form onSubmit={handleEdit} className="mt-4 space-y-4 text-left">
              <div>
                <label className="text-xs text-muted-foreground">Assigned State</label>
                <select
                  required
                  value={selectedStateId}
                  onChange={(e) => setSelectedStateId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="">Select State</option>
                  {states.map((st) => (
                    <option key={st.id} value={String(st.id)}>
                      {st.state_name} ({st.state_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">District Name</label>
                <input
                  required
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  placeholder="e.g. Pune"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">District Code</label>
                <input
                  required
                  value={districtCode}
                  onChange={(e) => setDistrictCode(e.target.value)}
                  placeholder="e.g. PUN"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDistrict(null);
                    setDistrictName("");
                    setDistrictCode("");
                    setSelectedStateId("");
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer border-0"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
