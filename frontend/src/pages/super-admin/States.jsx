import { useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import { Card, CardHeader, Tier } from "../../components/common/Page.jsx";
<<<<<<< Updated upstream
import { statesData } from "../../data/adminData.js";

const filters = ["All States", "Active", "Inactive", "Pending"];
=======
import { getStates, createState, updateState, deleteState, getSchools } from "../../api/schools";
import { toast } from "sonner";
import { INDIAN_STATES } from "../../data/indianStatesAndCities";
>>>>>>> Stashed changes

export default function States() {
  const [active, setActive] = useState("All States");
  const [q, setQ] = useState("");
<<<<<<< Updated upstream
  const rows = statesData.filter((r) => r.state.toLowerCase().includes(q.toLowerCase()));
=======
  const [filter, setFilter] = useState("All");

  // Modal control
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedState, setSelectedState] = useState(null);

  // Form inputs
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [formErrors, setFormErrors] = useState([]);

  const getBackendErrors = (err, fallback) => {
    const response = err?.response?.data || err;
    if (Array.isArray(response?.errors) && response.errors.length > 0) {
      return response.errors;
    }
    return [response?.message || err?.message || fallback];
  };

  const loadData = async () => {
    try {
      const statesRes = await getStates();
      const schoolsRes = await getSchools();
      if (statesRes.success) setStates(statesRes.data);
      if (schoolsRes.success) setSchools(schoolsRes.data);
    } catch (err) {
      toast.error("Failed to load states data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    try {
      const res = await createState({ name: stateName, code: stateCode });
      if (res.success) {
        toast.success("State created successfully");
        setShowAddModal(false);
        setStateName("");
        setStateCode("");
        loadData();
      }
    } catch (err) {
      const errors = getBackendErrors(err, "Failed to create state");
      setFormErrors(errors);
      toast.error(errors.join(" • "));
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    try {
      const res = await updateState(selectedState.id, { name: stateName, code: stateCode });
      if (res.success) {
        toast.success("State updated successfully");
        setShowEditModal(false);
        setSelectedState(null);
        setStateName("");
        setStateCode("");
        loadData();
      }
    } catch (err) {
      const errors = getBackendErrors(err, "Failed to update state");
      setFormErrors(errors);
      toast.error(errors.join(" • "));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this state? All associated districts and schools might be affected.")) return;
    try {
      const res = await deleteState(id);
      if (res.success) {
        toast.success("State deleted successfully");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete state");
    }
  };

  const openEditModal = (state) => {
    setSelectedState(state);
    setStateName(state.state_name);
    setStateCode(state.state_code);
    setFormErrors([]);
    setShowEditModal(true);
  };

  // Aggregate stats per state
  const aggregatedRows = states.map((s) => {
    const stateSchools = schools.filter(
      (sch) => sch.District?.State?.id === s.id || sch.District?.state_id === s.id
    );
    const active = stateSchools.filter((sch) => sch.status === "APPROVED").length;
    const pending = stateSchools.filter((sch) => sch.status === "PENDING").length;

    return {
      id: s.id,
      state: s.state_name,
      code: s.state_code,
      total: stateSchools.length,
      active,
      pending,
      tier: active > 5 ? "Platinum" : active > 2 ? "Gold" : "Silver",
    };
  });

  const filteredRows = aggregatedRows.filter((r) => {
    const matchesSearch = r.state.toLowerCase().includes(q.toLowerCase()) || r.code.toLowerCase().includes(q.toLowerCase());
    if (filter === "All") return matchesSearch;
    if (filter === "Active") return matchesSearch && r.active > 0;
    if (filter === "Inactive") return matchesSearch && r.total === 0;
    if (filter === "Pending") return matchesSearch && r.pending > 0;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-[#0b0c10] text-white rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Loading State Management...</p>
        </div>
      </div>
    );
  }
>>>>>>> Stashed changes

  return (
    <Card>
      <CardHeader
        title="State Management"
        subtitle={`${statesData.length} states registered across India`}
        action={
          <div className="flex flex-wrap items-center gap-2">
<<<<<<< Updated upstream
=======
            <button
              onClick={() => {
                setFormErrors([]);
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg cursor-pointer hover:opacity-90"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" /> Add State
            </button>
>>>>>>> Stashed changes
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActive(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${active === f ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
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
                placeholder="Search state…"
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
              <th className="px-5 py-3 text-left">State</th>
              <th className="px-5 py-3 text-left">Regional Admin</th>
              <th className="px-5 py-3 text-left">Total Schools</th>
              <th className="px-5 py-3 text-left">Active</th>
              <th className="px-5 py-3 text-left">Pending</th>
              <th className="px-5 py-3 text-left">Ranking Leader</th>
              <th className="px-5 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.state} className="border-t border-border">
                <td className="px-5 py-3 font-medium text-foreground">{r.state}</td>
                <td className="px-5 py-3 text-muted-foreground">{r.admin}</td>
                <td className="px-5 py-3 text-foreground">{r.total}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">{r.active}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">{r.pending}</span>
                </td>
                <td className="px-5 py-3"><Tier value={r.tier} /></td>
                <td className="px-5 py-3">
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-primary/20">
                    <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" /> View Region
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
<<<<<<< Updated upstream
=======

      {/* Add State Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Add New State</h3>
            <form onSubmit={handleAdd} className="mt-4 space-y-4">
              {formErrors.length > 0 && (
                <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {formErrors.map((error) => <div key={error}>{error}</div>)}
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground">Select State</label>
                <select
                  required
                  value={INDIAN_STATES.some(s => s.code === stateCode) ? stateCode : (stateCode ? "CUSTOM" : "")}
                  onChange={(e) => {
                    const code = e.target.value;
                    if (code === "CUSTOM") {
                      setStateCode("CUSTOM");
                      setStateName("");
                    } else {
                      const selected = INDIAN_STATES.find(s => s.code === code);
                      if (selected) {
                        setStateCode(selected.code);
                        setStateName(selected.name);
                      } else {
                        setStateCode("");
                        setStateName("");
                      }
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" style={{ background: "#1f2833" }}>-- Select a State --</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s.code} value={s.code} style={{ background: "#1f2833" }}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                  <option value="CUSTOM" style={{ background: "#1f2833" }}>-- Custom / Other State --</option>
                </select>
              </div>

              {(stateCode === "CUSTOM" || (stateCode && !INDIAN_STATES.some(s => s.code === stateCode))) && (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground">State Name</label>
                    <input
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">State Code</label>
                    <input
                      required
                      value={stateCode === "CUSTOM" ? "" : stateCode}
                      onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MH"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                    />
                  </div>
                </>
              )}

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
                  Add State
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit State Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Edit State Details</h3>
            <form onSubmit={handleEdit} className="mt-4 space-y-4">
              {formErrors.length > 0 && (
                <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {formErrors.map((error) => <div key={error}>{error}</div>)}
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground">Select State</label>
                <select
                  required
                  value={INDIAN_STATES.some(s => s.code === stateCode) ? stateCode : (stateCode ? "CUSTOM" : "")}
                  onChange={(e) => {
                    const code = e.target.value;
                    if (code === "CUSTOM") {
                      setStateCode("CUSTOM");
                      setStateName("");
                    } else {
                      const selected = INDIAN_STATES.find(s => s.code === code);
                      if (selected) {
                        setStateCode(selected.code);
                        setStateName(selected.name);
                      } else {
                        setStateCode("");
                        setStateName("");
                      }
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" style={{ background: "#1f2833" }}>-- Select a State --</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s.code} value={s.code} style={{ background: "#1f2833" }}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                  <option value="CUSTOM" style={{ background: "#1f2833" }}>-- Custom / Other State --</option>
                </select>
              </div>

              {(stateCode === "CUSTOM" || (stateCode && !INDIAN_STATES.some(s => s.code === stateCode))) && (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground">State Name</label>
                    <input
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">State Code</label>
                    <input
                      required
                      value={stateCode === "CUSTOM" ? "" : stateCode}
                      onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MH"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
>>>>>>> Stashed changes
    </Card>
  );
}
