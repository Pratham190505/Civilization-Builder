import { useState, useEffect } from "react";
import { HiOutlineMagnifyingGlass, HiOutlineArrowTopRightOnSquare, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { Card, CardHeader, Tier } from "../../components/common/Page.jsx";
import { getStates, createState, updateState, deleteState, getSchools } from "../../api/schools";
import { toast } from "sonner";

const INDIAN_STATES_AND_UTS = [
  { name: "Andaman and Nicobar Islands", code: "AN" },
  { name: "Andhra Pradesh", code: "AP" },
  { name: "Arunachal Pradesh", code: "AR" },
  { name: "Assam", code: "AS" },
  { name: "Bihar", code: "BR" },
  { name: "Chandigarh", code: "CH" },
  { name: "Chhattisgarh", code: "CG" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "DD" },
  { name: "Delhi", code: "DL" },
  { name: "Goa", code: "GA" },
  { name: "Gujarat", code: "GJ" },
  { name: "Haryana", code: "HR" },
  { name: "Himachal Pradesh", code: "HP" },
  { name: "Jammu and Kashmir", code: "JK" },
  { name: "Jharkhand", code: "JH" },
  { name: "Karnataka", code: "KA" },
  { name: "Kerala", code: "KL" },
  { name: "Ladakh", code: "LA" },
  { name: "Lakshadweep", code: "LD" },
  { name: "Madhya Pradesh", code: "MP" },
  { name: "Maharashtra", code: "MH" },
  { name: "Manipur", code: "MN" },
  { name: "Meghalaya", code: "ML" },
  { name: "Mizoram", code: "MZ" },
  { name: "Nagaland", code: "NL" },
  { name: "Odisha", code: "OD" },
  { name: "Puducherry", code: "PY" },
  { name: "Punjab", code: "PB" },
  { name: "Rajasthan", code: "RJ" },
  { name: "Sikkim", code: "SK" },
  { name: "Tamil Nadu", code: "TN" },
  { name: "Telangana", code: "TG" },
  { name: "Tripura", code: "TR" },
  { name: "Uttar Pradesh", code: "UP" },
  { name: "Uttarakhand", code: "UK" },
  { name: "West Bengal", code: "WB" }
];

export default function States() {
  const [states, setStates] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");

  // Modal control
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedState, setSelectedState] = useState(null);

  // Form inputs
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState("");

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
    try {
      const res = await createState({ state_name: stateName, state_code: stateCode });
      if (res.success) {
        toast.success("State created successfully");
        setShowAddModal(false);
        setStateName("");
        setStateCode("");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to create state");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateState(selectedState.id, { state_name: stateName, state_code: stateCode });
      if (res.success) {
        toast.success("State updated successfully");
        setShowEditModal(false);
        setSelectedState(null);
        setStateName("");
        setStateCode("");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update state");
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

  return (
    <Card>
      <CardHeader
        title="State Management"
        subtitle={`${states.length} states registered across India`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg cursor-pointer hover:opacity-90"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" /> Add State
            </button>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
              {["All", "Active", "Inactive", "Pending"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    filter === f ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
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
              <th className="px-5 py-3 text-left">State Name</th>
              <th className="px-5 py-3 text-left">State Code</th>
              <th className="px-5 py-3 text-left">Total Schools</th>
              <th className="px-5 py-3 text-left">Active Schools</th>
              <th className="px-5 py-3 text-left">Pending Approval</th>
              <th className="px-5 py-3 text-left">Ranking Tier</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-white/5 transition">
                <td className="px-5 py-3 font-medium text-foreground">{r.state}</td>
                <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{r.code}</td>
                <td className="px-5 py-3 text-foreground">{r.total}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                    {r.active}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                    {r.pending}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Tier value={r.tier} />
                </td>
                <td className="px-5 py-3 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => openEditModal(states.find((s) => s.id === r.id))}
                      className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition cursor-pointer"
                      title="Edit State"
                    >
                      <HiOutlinePencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition cursor-pointer"
                      title="Delete State"
                    >
                      <HiOutlineTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add State Modal */}
      {showAddModal && (() => {
        const existingNames = states.map((s) => s.state_name.toLowerCase());
        const availableStates = INDIAN_STATES_AND_UTS.filter(
          (st) => !existingNames.includes(st.name.toLowerCase())
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-foreground">Add New State</h3>
              <form onSubmit={handleAdd} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Select State / UT</label>
                  <select
                    required
                    value={stateName}
                    onChange={(e) => {
                      const selected = availableStates.find((st) => st.name === e.target.value);
                      if (selected) {
                        setStateName(selected.name);
                        setStateCode(selected.code);
                      } else {
                        setStateName("");
                        setStateCode("");
                      }
                    }}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="">Select State / UT</option>
                    {availableStates.map((st) => (
                      <option key={st.name} value={st.name}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>
                {stateCode && (
                  <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs text-muted-foreground">
                    Selected State Code: <span className="font-mono font-bold text-foreground">{stateCode}</span>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setStateName("");
                      setStateCode("");
                    }}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!stateName}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer disabled:opacity-50 border-0"
                  >
                    Add State
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Edit State Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Edit State Details</h3>
            <form onSubmit={handleEdit} className="mt-4 space-y-4">
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
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  placeholder="e.g. MH"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>
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
    </Card>
  );
}
