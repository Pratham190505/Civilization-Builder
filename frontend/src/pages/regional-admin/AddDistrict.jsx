import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Map,
  X,
  Save,
  Check
} from "lucide-react";

const inputStyle = {
  background: "var(--glass-card)",
  border: "1px solid var(--glass-border)",
  color: "var(--text-primary)",
  borderRadius: "12px",
};

const labelStyle = {
  color: "var(--text-secondary)",
  fontSize: "13px",
  fontWeight: 500,
};

export default function AddDistrict() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    area: "",
    description: "",
    status: "Active",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate("/regional-admin/districts");
    }, 1500);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6 regional-admin-theme pb-8 max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/regional-admin/districts")}
          className="rounded-xl transition-all cursor-pointer hover:bg-[var(--glass-hover)]"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-secondary)",
            padding: "0.75rem",
          }}
          title="Back to districts"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Add New District
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Register a new district in the state system
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {showSuccess && (
        <div
          className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in"
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#10B981" }}
          >
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ color: "#10B981" }}>
            District saved! Redirecting...
          </span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(16, 185, 129, 0.1)" }}
            >
              <Map className="w-4 h-4" style={{ color: "#10B981" }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              District Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* District Name */}
            <div className="space-y-1.5">
              <label style={labelStyle} className="flex items-center gap-1 font-semibold">
                District Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g. Ahmedabad"
                className="w-full px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[#6C63FF]/20"
                style={inputStyle}
              />
            </div>

            {/* District Code */}
            <div className="space-y-1.5">
              <label style={labelStyle} className="flex items-center gap-1 font-semibold">
                District Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                placeholder="e.g. AHM"
                className="w-full px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[#6C63FF]/20"
                style={inputStyle}
              />
            </div>

            {/* District Area */}
            <div className="space-y-1.5">
              <label style={labelStyle} className="font-semibold">Area (km²)</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                placeholder="e.g. 7,174"
                className="w-full px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[#6C63FF]/20"
                style={inputStyle}
              />
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label style={labelStyle} className="font-semibold">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 text-sm outline-none transition-all cursor-pointer"
                style={inputStyle}
              >
                {["Active", "Inactive"].map((status) => (
                  <option
                    key={status}
                    value={status}
                    style={{ background: "var(--dropdown-bg)" }}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Description textarea */}
            <div className="space-y-1.5 md:col-span-2">
              <label style={labelStyle} className="font-semibold">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the district..."
                rows={3}
                className="w-full px-3 py-2 text-sm outline-none resize-none transition-all focus:ring-2 focus:ring-[#6C63FF]/20"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate("/regional-admin/districts")}
            className="flex items-center gap-2 rounded-xl text-sm font-semibold transition-all hover:bg-[var(--glass-hover)] cursor-pointer"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
              padding: "0.9rem 1.25rem",
            }}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #10B981, #059669)",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
              padding: "0.9rem 1.25rem",
            }}
          >
            <Save className="w-4 h-4" />
            Save District
          </button>
        </div>
      </form>
    </div>
  );
}
