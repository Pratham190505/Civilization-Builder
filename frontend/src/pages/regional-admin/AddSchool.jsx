import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  School,
  Phone,
  BookOpen,
  X,
  Save,
  Check,
  Key
} from "lucide-react";

const districtOptions = [
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Rajkot",
  "Gandhinagar",
  "Bhavnagar",
  "Jamnagar",
  "Junagadh",
  "Kutch",
  "Patan",
  "Mehsana",
  "Anand",
  "Navsari",
  "Valsad",
  "Dahod",
];

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
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    district: "",
    city: "",
    address: "",
<<<<<<< Updated upstream
    pincode: "",
    instagramApi: "",
    facebookApi: "",
    youtubeApi: "",
    principal: "",
    phone: "",
    altPhone: "",
    email: "",
    website: "",
    category: "",
    status: "Active",
    year: "",
    strength: "",
=======
    student_count: "",
    teacher_count: "",
    school_admin_email: "",
    school_admin_password: "",
    confirm_password: "",
>>>>>>> Stashed changes
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
<<<<<<< Updated upstream
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate("/regional-admin/schools");
    }, 1500);
=======
    try {
      if (!formData.district_id) {
        toast.error("Please select a district");
        return;
      }

      if (!formData.school_admin_email) {
        toast.error("Please enter a school admin email");
        return;
      }
      if (formData.school_admin_password !== formData.confirm_password) {
        toast.error("Passwords do not match");
        return;
      }
      if (formData.school_admin_password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
      if (!/[a-z]/.test(formData.school_admin_password)) {
        toast.error("Password must include a lowercase letter");
        return;
      }
      if (!/[A-Z]/.test(formData.school_admin_password)) {
        toast.error("Password must include an uppercase letter");
        return;
      }
      if (!/\d/.test(formData.school_admin_password)) {
        toast.error("Password must include a number");
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
>>>>>>> Stashed changes
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6 regional-admin-theme pb-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/regional-admin/schools")}
          className="rounded-xl transition-all cursor-pointer hover:bg-[var(--glass-hover)]"
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
            Fill in the details below to register a new school
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Auto-save enabled
          </span>
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
            School saved successfully! Redirecting...
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
<<<<<<< Updated upstream
              name="name"
=======
              value={formData.school_name}
              onChange={(e) => handleInputChange("school_name", e.target.value)}
>>>>>>> Stashed changes
              placeholder="e.g. Navyug Vidyalaya"
              required
            />
            <FormField
              label="School Code"
<<<<<<< Updated upstream
              name="code"
=======
              value={formData.school_code}
              onChange={(e) => handleInputChange("school_code", e.target.value)}
>>>>>>> Stashed changes
              placeholder="e.g. GJ-AHM-001"
              required
            />

            <div className="space-y-1.5">
              <label style={labelStyle} className="flex items-center gap-1 font-semibold">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                required
                className="w-full px-3 py-2 text-sm outline-none transition-all cursor-pointer"
                style={inputStyle}
              >
                <option value="" style={{ background: "var(--dropdown-bg)" }}>
                  Select District
                </option>
                {districtOptions.map((dist) => (
                  <option
                    key={dist}
                    value={dist}
                    style={{ background: "var(--dropdown-bg)" }}
                  >
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <FormField
<<<<<<< Updated upstream
              label="City"
              name="city"
              placeholder="e.g. Ahmedabad"
=======
              label="UDISE Code"
              value={formData.udise_code}
              onChange={(e) => handleInputChange("udise_code", e.target.value)}
              placeholder="e.g. 24071201201"
>>>>>>> Stashed changes
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

            <FormField
              label="Pincode"
              name="pincode"
              placeholder="e.g. 380001"
            />
            <FormField
              label="Instagram API"
              name="instagramApi"
              placeholder="Instagram API URL or key"
            />
            <FormField
              label="Facebook API"
              name="facebookApi"
              placeholder="Facebook API URL or key"
            />
            <FormField
              label="YouTube API"
              name="youtubeApi"
              placeholder="YouTube API URL or key"
            />
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
<<<<<<< Updated upstream
              name="principal"
=======
              value={formData.principal_name}
              onChange={(e) => handleInputChange("principal_name", e.target.value)}
>>>>>>> Stashed changes
              placeholder="Dr. / Mr. / Mrs."
              required
            />
            <FormField
              label="Phone Number"
<<<<<<< Updated upstream
              name="phone"
=======
>>>>>>> Stashed changes
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              placeholder="+91 98765 43210"
              required
            />
            <FormField
              label="Alternate Phone"
              name="altPhone"
              type="tel"
              placeholder="+91 98765 43211"
            />
            <FormField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="school@example.com"
              required
            />
            <FormField
              label="Website"
              name="website"
              placeholder="www.schoolname.edu.in"
            />
          </div>
        </div>

        {/* Section 3: School Details */}
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
              Section 3/4
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label style={labelStyle} className="font-semibold">Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-3 py-2 text-sm outline-none transition-all cursor-pointer"
                style={inputStyle}
              >
                <option value="" style={{ background: "var(--dropdown-bg)" }}>Select Category</option>
                {["Platinum", "Gold", "Silver", "Bronze", "No Rank"].map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    style={{ background: "var(--dropdown-bg)" }}
                  >
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label style={labelStyle} className="font-semibold">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 text-sm outline-none transition-all cursor-pointer"
                style={inputStyle}
              >
                {["Active", "Inactive", "Pending"].map((status) => (
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

            <FormField
<<<<<<< Updated upstream
              label="Established Year"
              name="year"
              type="number"
              placeholder="e.g. 2005"
            />
            <FormField
              label="Student Strength"
              name="strength"
              type="number"
              placeholder="e.g. 1200"
=======
              label="Student Count"
              type="number"
              value={formData.student_count}
              onChange={(e) => handleInputChange("student_count", e.target.value)}
              placeholder="e.g. 1200"
            />
            <FormField
              label="Teacher Count"
              type="number"
              value={formData.teacher_count}
              onChange={(e) => handleInputChange("teacher_count", e.target.value)}
              placeholder="e.g. 45"
>>>>>>> Stashed changes
            />
          </div>
        </div>

        {/* Section 4: School Admin Credentials */}
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
              style={{ background: "rgba(139, 92, 246, 0.1)" }}
            >
              <Key className="w-4 h-4" style={{ color: "#8B5CF6" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                School Admin Credentials
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Credentials for the school administrator account
              </p>
            </div>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: "rgba(139, 92, 246, 0.1)",
                color: "#8B5CF6",
              }}
            >
              Section 4/4
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="School Admin Email"
              type="email"
              value={formData.school_admin_email}
              onChange={(e) => handleInputChange("school_admin_email", e.target.value)}
              placeholder="admin@school.com"
              required
            />
            <div className="hidden md:block"></div>
            
            <FormField
              label="Password"
              type="password"
              value={formData.school_admin_password}
              onChange={(e) => handleInputChange("school_admin_password", e.target.value)}
              placeholder="••••••••"
              required
            />
            <FormField
              label="Confirm Password"
              type="password"
              value={formData.confirm_password}
              onChange={(e) => handleInputChange("confirm_password", e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Form CTA Buttons */}
        <div className="flex items-center gap-3 justify-end pb-8">
          <button
            type="button"
            onClick={() => navigate("/regional-admin/schools")}
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
              background: "linear-gradient(135deg, #3B82F6, #6366F1)",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
              padding: "0.9rem 1.25rem",
            }}
          >
            <Save className="w-4 h-4" />
            Save School
          </button>
        </div>
      </form>
    </div>
  );
}

// Reusable Form Field Component defined outside parent component to prevent losing focus on re-renders
function FormField({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div className="space-y-1.5">
      <label style={labelStyle} className="flex items-center gap-1 font-semibold">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[#6C63FF]/20"
        style={inputStyle}
      />
    </div>
  );
}

