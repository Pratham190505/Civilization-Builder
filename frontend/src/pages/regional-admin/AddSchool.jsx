import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { createSchool, getDistricts } from "../../api/schools";
import { toast } from "sonner";
import {
  ArrowLeft,
  School,
  Phone,
  BookOpen,
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

export default function AddSchool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [districtsList, setDistrictsList] = useState([]);
  const [formData, setFormData] = useState({
    school_name: "",
    school_code: "",
    district_id: "",
    udise_code: "",
    principal_name: "",
    email: "",
    mobile: "",
    address: "",
    student_count: "",
    teacher_count: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const stateId = user?.scope?.stateId || (user?.scope?.stateIds && user.scope.stateIds[0]) || 1;

  useEffect(() => {
    async function loadDistricts() {
      try {
        const res = await getDistricts();
        if (res.success) {
          // Filter districts by regional admin's state ID
          const scoped = res.data.filter(d => !stateId || d.state_id === stateId);
          setDistrictsList(scoped);
        }
      } catch (err) {
        console.error("Failed to load districts:", err);
      }
    }
    loadDistricts();
  }, [stateId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.district_id) {
        toast.error("Please select a district");
        return;
      }

      const res = await createSchool({
        ...formData,
        district_id: parseInt(formData.district_id, 10),
        student_count: formData.student_count ? parseInt(formData.student_count, 10) : 0,
        teacher_count: formData.teacher_count ? parseInt(formData.teacher_count, 10) : 0,
      });

      if (res.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/regional-admin/schools");
        }, 1500);
      } else {
        toast.error(res.message || "Failed to register school");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reusable Form Field Component
  function FormField({ label, name, type = "text", placeholder, required }) {
    return (
      <div className="space-y-1.5">
        <label style={labelStyle} className="flex items-center gap-1 font-semibold">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          value={formData[name]}
          onChange={(e) => handleInputChange(name, e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[#6C63FF]/20"
          style={inputStyle}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 regional-admin-theme pb-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/regional-admin/schools")}
          className="rounded-xl transition-all cursor-pointer hover:bg-[var(--glass-hover)] border-0"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-secondary)",
            padding: "0.75rem",
          }}
          title="Back to schools"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Add New School
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Fill in the details below to register a new school onboarding request
          </p>
        </div>
      </div>

      {/* Success Notification */}
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
            School registration submitted successfully! Redirecting...
          </span>
        </div>
      )}

      {/* Add School Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(59, 130, 246, 0.1)" }}
            >
              <School className="w-4 h-4" style={{ color: "#3B82F6" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Basic Information
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Core school identification details
              </p>
            </div>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                color: "#3B82F6",
              }}
            >
              Section 1/3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="School Name"
              name="school_name"
              placeholder="e.g. Navyug Vidyalaya"
              required
            />
            <FormField
              label="School Code"
              name="school_code"
              placeholder="e.g. GJ-AHM-001"
              required
            />

            <div className="space-y-1.5">
              <label style={labelStyle} className="flex items-center gap-1 font-semibold">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.district_id}
                onChange={(e) => handleInputChange("district_id", e.target.value)}
                required
                className="w-full px-3 py-2 text-sm outline-none transition-all cursor-pointer"
                style={inputStyle}
              >
                <option value="" style={{ background: "var(--dropdown-bg)" }}>
                  Select District
                </option>
                {districtsList.map((dist) => (
                  <option
                    key={dist.id}
                    value={dist.id}
                    style={{ background: "var(--dropdown-bg)" }}
                  >
                    {dist.district_name}
                  </option>
                ))}
              </select>
            </div>

            <FormField
              label="UDISE Code"
              name="udise_code"
              placeholder="e.g. 24071201201"
              required
            />

            <div className="space-y-1.5 md:col-span-2">
              <label style={labelStyle} className="font-semibold">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Full school address..."
                rows={2}
                className="w-full px-3 py-2 text-sm outline-none resize-none transition-all"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(16, 185, 129, 0.1)" }}
            >
              <Phone className="w-4 h-4" style={{ color: "#10B981" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Contact Information
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Contact details and communication channels
              </p>
            </div>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                color: "#10B981",
              }}
            >
              Section 2/3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Principal Name"
              name="principal_name"
              placeholder="Dr. / Mr. / Mrs."
              required
            />
            <FormField
              label="Phone Number"
              name="mobile"
              type="tel"
              placeholder="+91 98765 43210"
              required
            />
            <FormField
              label="Email Address"
              name="email"
              type="email"
              placeholder="school@example.com"
              required
            />
          </div>
        </div>

        {/* Section 3: School Statistics */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(245, 158, 11, 0.1)" }}
            >
              <BookOpen className="w-4 h-4" style={{ color: "#F59E0B" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                School Details
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Academic and institutional information
              </p>
            </div>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                color: "#F59E0B",
              }}
            >
              Section 3/3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Student Count"
              name="student_count"
              type="number"
              placeholder="e.g. 1200"
            />
            <FormField
              label="Teacher Count"
              name="teacher_count"
              type="number"
              placeholder="e.g. 45"
            />
          </div>
        </div>

        {/* Form CTA Buttons */}
        <div className="flex items-center gap-3 justify-end pb-8">
          <button
            type="button"
            onClick={() => navigate("/regional-admin/schools")}
            className="flex items-center gap-2 rounded-xl text-sm font-semibold transition-all hover:bg-[var(--glass-hover)] cursor-pointer border-0"
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
            className="flex items-center gap-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer border-0"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #6366F1)",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
              padding: "0.9rem 1.25rem",
            }}
          >
            <Save className="w-4 h-4" />
            Register School
          </button>
        </div>
      </form>
    </div>
  );
}
