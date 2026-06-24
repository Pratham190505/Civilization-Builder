import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { createSchool, getDistricts, getDistrictCities } from "../../api/schools";
import { toast } from "sonner";
import {
  ArrowLeft,
  School,
  Phone,
  BookOpen,
  X,
  Save,
  Check,
  Building,
  MapPin,
  Users,
  AlertCircle,
  FileText,
  Lock,
  ChevronRight,
  ChevronLeft
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

const FormContext = createContext(null);

function FormField({ label, name, type = "text", placeholder, required, disabled = false }) {
  const context = useContext(FormContext);
  const formData = context?.formData || {};
  const handleInputChange = context?.handleInputChange || (() => {});
  
  return (
    <div className="space-y-1.5">
      <label style={labelStyle} className="flex items-center gap-1 font-semibold">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={formData[name] || ""}
        onChange={(e) => handleInputChange(name, e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[#6C63FF]/20"
        style={inputStyle}
      />
    </div>
  );
}

export default function AddSchool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [districtsList, setDistrictsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoMockFile, setLogoMockFile] = useState(null);

  const [formData, setFormData] = useState({
    // Section 1: School Information
    school_name: "",
    school_code: "",
    school_type: "Co-Ed",
    affiliation_board: "CBSE",
    email: "",
    mobile: "",
    alternate_mobile: "",
    website: "",
    establishment_year: "",
    logo_url: "",

    // Section 2: Location Information
    district_id: "",
    city: "",
    taluka: "",
    pin_code: "",
    address: "",

    // Section 3: Principal Information
    principal_name: "",
    principal_email: "",
    principal_mobile: "",
    principal_qualification: "",

    // Section 4: School Admin Account
    admin_name: "",
    admin_email: "",
    admin_mobile: "",
    admin_username: "",
    admin_password: "",
    admin_confirm_password: "",

    // Section 5: School Strength
    student_count: "",
    boys_count: "",
    girls_count: "",
    teacher_count: "",
    male_teachers_count: "",
    female_teachers_count: "",
    non_teaching_staff_count: "",

    // Section 6: Infrastructure
    classrooms_count: "",
    labs_count: "",
    computer_labs_count: "",
    library_available: false,
    playground_available: false,
    smart_classrooms_count: "",
    auditorium_available: false,
    transport_available: false,

    // Section 7: Additional Details
    description: "",
    achievements: "",
    facebook_url: "",
    instagram_url: "",
    youtube_url: "",
    website_url: "",
    notes: "",
  });

  const stateId = user?.scope?.stateId || (user?.scope?.stateIds && user.scope.stateIds[0]) || 1;
  const stateName = user?.scope?.stateName || "Karnataka";

  useEffect(() => {
    async function loadDistricts() {
      try {
        const res = await getDistricts();
        if (res.success) {
          // Filter districts by regional admin's state ID
          const scoped = res.data.filter(d => !stateId || Number(d.state_id) === Number(stateId));
          setDistrictsList(scoped);
        }
      } catch (err) {
        console.error("Failed to load districts:", err);
      }
    }
    loadDistricts();
  }, [stateId]);

  // Load cities based on chosen district
  useEffect(() => {
    let active = true;
    if (formData.district_id) {
      getDistrictCities(formData.district_id)
        .then((res) => {
          if (active && res.success) {
            setCitiesList(res.data || []);
          }
        })
        .catch((err) => {
          if (active) {
            console.error("Failed to load cities:", err);
            setCitiesList([]);
          }
        });
    } else {
      setCitiesList([]);
    }
    return () => {
      active = false;
    };
  }, [formData.district_id]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate totals if sub-components are provided
      if (field === "boys_count" || field === "girls_count") {
        const boys = parseInt(field === "boys_count" ? value : prev.boys_count, 10) || 0;
        const girls = parseInt(field === "girls_count" ? value : prev.girls_count, 10) || 0;
        updated.student_count = String(boys + girls);
      }
      
      if (field === "male_teachers_count" || field === "female_teachers_count") {
        const male = parseInt(field === "male_teachers_count" ? value : prev.male_teachers_count, 10) || 0;
        const female = parseInt(field === "female_teachers_count" ? value : prev.female_teachers_count, 10) || 0;
        updated.teacher_count = String(male + female);
      }

      // Auto-fill username if admin email is entered
      if (field === "admin_email") {
        updated.admin_username = value.split("@")[0] || "";
      }

      return updated;
    });
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character";
    return null;
  };

  const stepsList = [
    "School Info",
    "Location",
    "Principal",
    "Admin Account",
    "Strength",
    "Infrastructure",
    "Additional"
  ];
  const TOTAL_STEPS = stepsList.length;

  const validateStep = (s) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    
    if (s === 1) {
      if (!formData.school_name.trim()) return "School Name is required";
      if (!formData.school_code.trim()) return "School Code is required";
      if (!formData.email.trim()) return "School Email is required";
      if (!emailRegex.test(formData.email)) return "Invalid School Email format";
      if (!formData.mobile.trim()) return "School Contact Number is required";
      if (!phoneRegex.test(formData.mobile.replace(/\D/g, ''))) return "School Contact Number must be a 10-digit number";
      if (formData.alternate_mobile && !phoneRegex.test(formData.alternate_mobile.replace(/\D/g, ''))) return "Alternate Contact Number must be a 10-digit number";
      if (formData.establishment_year) {
        const year = parseInt(formData.establishment_year, 10);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1800 || year > currentYear) return `Establishment Year must be between 1800 and ${currentYear}`;
      }
    }
    
    if (s === 2) {
      if (!formData.district_id) return "District selection is required";
      if (!formData.city) return "City is required";
      if (!formData.pin_code.trim()) return "PIN Code is required";
      if (!/^[0-9]{6}$/.test(formData.pin_code.trim())) return "PIN Code must be a 6-digit number";
      if (!formData.address.trim()) return "Full Address is required";
    }
    
    if (s === 3) {
      if (!formData.principal_name.trim()) return "Principal Name is required";
      if (!formData.principal_email.trim()) return "Principal Email is required";
      if (!emailRegex.test(formData.principal_email)) return "Invalid Principal Email format";
      if (!formData.principal_mobile.trim()) return "Principal Contact Number is required";
      if (!phoneRegex.test(formData.principal_mobile.replace(/\D/g, ''))) return "Principal Contact Number must be a 10-digit number";
    }
    
    if (s === 4) {
      if (!formData.admin_name.trim()) return "Admin Name is required";
      if (!formData.admin_email.trim()) return "Admin Email is required";
      if (!emailRegex.test(formData.admin_email)) return "Invalid Admin Email format";
      if (!formData.admin_mobile.trim()) return "Admin Mobile Number is required";
      if (!phoneRegex.test(formData.admin_mobile.replace(/\D/g, ''))) return "Admin Mobile Number must be a 10-digit number";
      if (!formData.admin_password) return "Password is required";
      
      const pwdError = validatePassword(formData.admin_password);
      if (pwdError) return pwdError;
      
      if (formData.admin_password !== formData.admin_confirm_password) return "Passwords do not match";
    }
    
    if (s === 5) {
      const numFields = ['boys_count', 'girls_count', 'male_teachers_count', 'female_teachers_count', 'non_teaching_staff_count'];
      for (const field of numFields) {
        if (formData[field]) {
          const val = parseInt(formData[field], 10);
          if (isNaN(val) || val < 0) return `${field.replace('_count', '').replace('_', ' ')} count must be a non-negative number`;
        }
      }
    }
    
    if (s === 6) {
      const numFields = ['classrooms_count', 'labs_count', 'computer_labs_count', 'smart_classrooms_count'];
      for (const field of numFields) {
        if (formData[field]) {
          const val = parseInt(formData[field], 10);
          if (isNaN(val) || val < 0) return `${field.replace('_count', '').replace('_', ' ')} count must be a non-negative number`;
        }
      }
    }

    if (s === TOTAL_STEPS) {
      const fbRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+$/i;
      const igRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/i;
      const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i;
      const webRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i;

      if (formData.facebook_url && !fbRegex.test(formData.facebook_url)) {
        return "Invalid Facebook Page URL (must contain facebook.com or fb.com)";
      }
      if (formData.instagram_url && !igRegex.test(formData.instagram_url)) {
        return "Invalid Instagram Page URL (must contain instagram.com)";
      }
      if (formData.youtube_url && !ytRegex.test(formData.youtube_url)) {
        return "Invalid YouTube Channel URL (must contain youtube.com or youtu.be)";
      }
      if (formData.website_url && !webRegex.test(formData.website_url)) {
        return "Invalid Website URL format";
      }
    }
    
    return null;
  };

  const handleNext = (e) => {
    e?.preventDefault?.();
    if (step >= TOTAL_STEPS) return;

    const error = validateStep(step);
    if (error) {
      toast.error(error);
      return;
    }
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < TOTAL_STEPS) {
      handleNext();
      return;
    }

    const error = validateStep(step);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createSchool({
        ...formData,
        district_id: parseInt(formData.district_id, 10),
        establishment_year: formData.establishment_year ? parseInt(formData.establishment_year, 10) : null,
        student_count: formData.student_count ? parseInt(formData.student_count, 10) : 0,
        boys_count: formData.boys_count ? parseInt(formData.boys_count, 10) : 0,
        girls_count: formData.girls_count ? parseInt(formData.girls_count, 10) : 0,
        teacher_count: formData.teacher_count ? parseInt(formData.teacher_count, 10) : 0,
        male_teachers_count: formData.male_teachers_count ? parseInt(formData.male_teachers_count, 10) : 0,
        female_teachers_count: formData.female_teachers_count ? parseInt(formData.female_teachers_count, 10) : 0,
        non_teaching_staff_count: formData.non_teaching_staff_count ? parseInt(formData.non_teaching_staff_count, 10) : 0,
        classrooms_count: formData.classrooms_count ? parseInt(formData.classrooms_count, 10) : 0,
        labs_count: formData.labs_count ? parseInt(formData.labs_count, 10) : 0,
        computer_labs_count: formData.computer_labs_count ? parseInt(formData.computer_labs_count, 10) : 0,
        smart_classrooms_count: formData.smart_classrooms_count ? parseInt(formData.smart_classrooms_count, 10) : 0,
        library_available: formData.library_available ? 1 : 0,
        playground_available: formData.playground_available ? 1 : 0,
        auditorium_available: formData.auditorium_available ? 1 : 0,
        transport_available: formData.transport_available ? 1 : 0,
      });

      if (res.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/regional-admin/schools");
        }, 1500);
      } else {
        toast.error(res.message || "Failed to onboard school");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContext.Provider value={{ formData, handleInputChange }}>
      <div className="space-y-6 regional-admin-theme pb-8 max-w-5xl">
      {/* Header */}
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
            School Onboarding Wizard
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Provide complete institutional, infrastructural, and administrative details to register this school.
          </p>
        </div>
      </div>

      {/* Steps Progress Indicator */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 pt-1 px-1 gap-4" style={{ borderBottom: "1px solid var(--glass-border)" }}>
        {stepsList.map((stepName, index) => {
          const stepNumber = index + 1;
          const isActive = step === stepNumber;
          const isCompleted = step > stepNumber;
          return (
            <div key={stepName} className="flex items-center gap-2 min-w-fit">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#6C63FF] text-white ring-4 ring-[#6C63FF]/20"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-[var(--glass-card)] border border-[var(--glass-border)] text-[var(--text-secondary)]"
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNumber}
              </div>
              <span
                className={`text-[12px] font-semibold ${
                  isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                }`}
              >
                {stepName}
              </span>
              {index < stepsList.length - 1 && (
                <div className="w-6 h-[1px] bg-[var(--glass-border)] ml-2" />
              )}
            </div>
          );
        })}
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
            School onboarding completed successfully! Redirecting...
          </span>
        </div>
      )}

      {/* Onboarding Wizard step content wrapper */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        
        {/* STEP 1: School Information */}
        {step === 1 && (
          <div
            className="rounded-2xl p-6 space-y-5 animate-fade-in"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10">
                <School className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Section 1: School Information</h3>
                <p className="text-xs text-[var(--text-muted)]">Core institutional identification and credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="School Name" name="school_name" placeholder="e.g. Navyug Vidyalaya" required />
              <FormField label="School Code" name="school_code" placeholder="e.g. GDS-KA-01" required />
              
              <div className="space-y-1.5">
                <label style={labelStyle} className="font-semibold">School Type</label>
                <select
                  value={formData.school_type}
                  onChange={(e) => handleInputChange("school_type", e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none transition-all cursor-pointer"
                  style={inputStyle}
                >
                  <option value="Co-Ed">Co-Educational</option>
                  <option value="Girls Only">Girls Only</option>
                  <option value="Boys Only">Boys Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label style={labelStyle} className="font-semibold">Affiliation Board</label>
                <select
                  value={formData.affiliation_board}
                  onChange={(e) => handleInputChange("affiliation_board", e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none transition-all cursor-pointer"
                  style={inputStyle}
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">International Baccalaureate (IB)</option>
                </select>
              </div>

              <FormField label="School General Email" name="email" type="email" placeholder="info@school.com" required />
              <FormField label="Contact Number" name="mobile" type="tel" placeholder="10-digit number" required />
              <FormField label="Alternate Contact Number" name="alternate_mobile" type="tel" placeholder="10-digit number" />
              <FormField label="School Website" name="website" type="url" placeholder="https://www.school.com" />
              <FormField label="Establishment Year" name="establishment_year" type="number" placeholder="e.g. 1995" />
              
              {/* Logo Selection mock */}
              <div className="space-y-1.5 md:col-span-2">
                <label style={labelStyle} className="font-semibold">School Logo</label>
                <div 
                  className="border-2 border-dashed border-[var(--glass-border)] rounded-xl p-4 text-center cursor-pointer hover:bg-[var(--glass-hover)] transition-all flex flex-direction-col items-center justify-center gap-2"
                  onClick={() => {
                    setLogoMockFile("logo_selected.png");
                    handleInputChange("logo_url", "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=80&fit=crop");
                  }}
                >
                  <Building className="w-6 h-6 text-[var(--text-secondary)]" />
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    {logoMockFile ? `Selected: ${logoMockFile} (Click to change)` : "Click to select or upload school logo"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location Information */}
        {step === 2 && (
          <div
            className="rounded-2xl p-6 space-y-5 animate-fade-in"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10">
                <MapPin className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Section 2: Location Information</h3>
                <p className="text-xs text-[var(--text-muted)]">Geographical boundaries and mapping details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label style={labelStyle} className="font-semibold">State (Scope Lock)</label>
                <input
                  type="text"
                  value={stateName}
                  disabled
                  className="w-full px-3 py-2 text-sm bg-[var(--glass-disabled)] border border-[var(--glass-border)] text-[var(--text-muted)] cursor-not-allowed outline-none"
                  style={{ ...inputStyle, opacity: 0.6 }}
                />
              </div>

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
                  <option value="">Select District</option>
                  {districtsList.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.district_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label style={labelStyle} className="flex items-center gap-1 font-semibold">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                  disabled={!formData.district_id}
                  className="w-full px-3 py-2 text-sm outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={inputStyle}
                >
                  <option value="">Select City</option>
                  {citiesList.map((cityOpt) => (
                    <option key={cityOpt} value={cityOpt}>
                      {cityOpt}
                    </option>
                  ))}
                </select>
              </div>

              <FormField label="Taluka / Block" name="taluka" placeholder="e.g. Whitefield" />
              <FormField label="PIN Code" name="pin_code" placeholder="e.g. 560066" required />
              
              <div className="space-y-1.5 md:col-span-2">
                <label style={labelStyle} className="font-semibold">Full Address <span className="text-red-500">*</span></label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Street name, landmark details..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 text-sm outline-none resize-none transition-all"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Principal Information */}
        {step === 3 && (
          <div
            className="rounded-2xl p-6 space-y-5 animate-fade-in"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500/10">
                <Phone className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Section 3: Principal Information</h3>
                <p className="text-xs text-[var(--text-muted)]">Principal leadership contacts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Principal Name" name="principal_name" placeholder="Dr. / Mr. / Mrs." required />
              <FormField label="Principal Email" name="principal_email" type="email" placeholder="principal@school.com" required />
              <FormField label="Principal Mobile Number" name="principal_mobile" type="tel" placeholder="10-digit number" required />
              <FormField label="Principal Qualification" name="principal_qualification" placeholder="e.g. Ph.D in Education / M.Ed" />
            </div>
          </div>
        )}

        {/* STEP 4: School Admin Account */}
        {step === 4 && (
          <div
            className="rounded-2xl p-6 space-y-5 animate-fade-in"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/10">
                <Lock className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Section 4: School Admin Account</h3>
                <p className="text-xs text-[var(--text-muted)]">Credentials for local portal system administrator</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Admin Name" name="admin_name" placeholder="Full name of admin" required />
              <FormField label="Admin Email" name="admin_email" type="email" placeholder="admin@school.com" required />
              <FormField label="Admin Mobile" name="admin_mobile" type="tel" placeholder="10-digit number" required />
              <FormField label="Username (Auto-derived)" name="admin_username" placeholder="Username" disabled required />
              <FormField label="Password" name="admin_password" type="password" placeholder="Strong password" required />
              <FormField label="Confirm Password" name="admin_confirm_password" type="password" placeholder="Re-enter password" required />
            </div>

            {/* Password guidance note */}
            <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-[var(--text-secondary)] space-y-1">
              <span className="font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-purple-400" /> Password Requirements:
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-[var(--text-muted)]">
                <li>At least 8 characters long</li>
                <li>Contain one uppercase letter (A-Z) and one lowercase letter (a-z)</li>
                <li>Contain at least one numeric digit (0-9)</li>
                <li>Contain at least one special character (e.g. !, @, #, $, %)</li>
              </ul>
            </div>
          </div>
        )}

        {/* STEP 5: School Strength */}
        {step === 5 && (
          <div
            className="rounded-2xl p-6 space-y-5 animate-fade-in"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500/10">
                <Users className="w-4 h-4 text-cyan-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Section 5: School Strength</h3>
                <p className="text-xs text-[var(--text-muted)]">Student body and staffing demographics</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-[var(--glass-border)] p-4 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-cyan-400">Student Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Boys Count" name="boys_count" type="number" placeholder="e.g. 250" />
                  <FormField label="Girls Count" name="girls_count" type="number" placeholder="e.g. 200" />
                  <FormField label="Total Students (Auto-sum)" name="student_count" type="number" placeholder="Total" disabled />
                </div>
              </div>

              <div className="border border-[var(--glass-border)] p-4 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-cyan-400">Faculty & Staff Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField label="Male Teachers" name="male_teachers_count" type="number" placeholder="e.g. 15" />
                  <FormField label="Female Teachers" name="female_teachers_count" type="number" placeholder="e.g. 25" />
                  <FormField label="Total Teachers (Auto-sum)" name="teacher_count" type="number" placeholder="Total" disabled />
                  <FormField label="Non-Teaching Staff" name="non_teaching_staff_count" type="number" placeholder="e.g. 8" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: School Infrastructure */}
        {step === 6 && (
          <div
            className="rounded-2xl p-6 space-y-5 animate-fade-in"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-500/10">
                <BookOpen className="w-4 h-4 text-teal-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Section 6: School Infrastructure</h3>
                <p className="text-xs text-[var(--text-muted)]">Classrooms and resources logs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField label="Number of Classrooms" name="classrooms_count" type="number" placeholder="e.g. 24" />
                <FormField label="Number of Labs" name="labs_count" type="number" placeholder="e.g. 3" />
                <FormField label="Number of Computer Labs" name="computer_labs_count" type="number" placeholder="e.g. 2" />
                <FormField label="Smart Classrooms Count" name="smart_classrooms_count" type="number" placeholder="e.g. 5" />
              </div>

              {/* Toggles & Checkboxes */}
              <div className="space-y-4 border border-[var(--glass-border)] p-4 rounded-xl flex flex-col justify-center">
                <h4 className="text-xs font-bold text-teal-400 mb-2">Available Amenities</h4>
                
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-[var(--text-secondary)] font-semibold">Library Available</span>
                  <input
                    type="checkbox"
                    checked={formData.library_available}
                    onChange={(e) => handleInputChange("library_available", e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-[#6C63FF]"
                  />
                </div>

                <div className="flex items-center justify-between py-1 border-t border-[var(--glass-border)]">
                  <span className="text-xs text-[var(--text-secondary)] font-semibold">Playground Available</span>
                  <input
                    type="checkbox"
                    checked={formData.playground_available}
                    onChange={(e) => handleInputChange("playground_available", e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-[#6C63FF]"
                  />
                </div>

                <div className="flex items-center justify-between py-1 border-t border-[var(--glass-border)]">
                  <span className="text-xs text-[var(--text-secondary)] font-semibold">Auditorium Available</span>
                  <input
                    type="checkbox"
                    checked={formData.auditorium_available}
                    onChange={(e) => handleInputChange("auditorium_available", e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-[#6C63FF]"
                  />
                </div>

                <div className="flex items-center justify-between py-1 border-t border-[var(--glass-border)]">
                  <span className="text-xs text-[var(--text-secondary)] font-semibold">Transport Facility Available</span>
                  <input
                    type="checkbox"
                    checked={formData.transport_available}
                    onChange={(e) => handleInputChange("transport_available", e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-[#6C63FF]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Additional Details */}
        {step === TOTAL_STEPS && (
          <div
            className="rounded-2xl p-6 space-y-5 animate-fade-in"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--glass-border)] pb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10">
                <FileText className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Section 7: Additional Details</h3>
                <p className="text-xs text-[var(--text-muted)]">Extra insights and social coordinates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label style={labelStyle} className="font-semibold">School Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Summary of school culture, goals, history..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm outline-none resize-none transition-all"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-1.5">
                <label style={labelStyle} className="font-semibold">Achievements</label>
                <textarea
                  value={formData.achievements}
                  onChange={(e) => handleInputChange("achievements", e.target.value)}
                  placeholder="Key milestones, awards, outstanding performance logs..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm outline-none resize-none transition-all"
                  style={inputStyle}
                />
              </div>

              <div className="border border-[var(--glass-border)] p-4 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-indigo-400">Social Media Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Facebook Page URL" name="facebook_url" type="url" placeholder="https://facebook.com/school" />
                  <FormField label="Instagram Page URL" name="instagram_url" type="url" placeholder="https://instagram.com/school" />
                  <FormField label="YouTube Channel URL" name="youtube_url" type="url" placeholder="https://youtube.com/school" />
                  <FormField label="Website URL (optional)" name="website_url" type="url" placeholder="https://www.school.com" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label style={labelStyle} className="font-semibold">Internal Notes (Visible only to admins)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Extra remarks or verification guidelines..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm outline-none resize-none transition-all"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* Form CTA Buttons */}
        <div className="flex items-center gap-3 justify-end pb-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl text-sm font-semibold transition-all hover:bg-[var(--glass-hover)] cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "var(--glass-card)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-secondary)",
                padding: "0.9rem 1.25rem",
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/regional-admin/schools")}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl text-sm font-semibold transition-all hover:bg-[var(--glass-hover)] cursor-pointer border-0 disabled:opacity-50"
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
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer border-0"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                padding: "0.9rem 1.25rem",
              }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                padding: "0.9rem 1.25rem",
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Onboarding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Onboard School
                </>
              )}
            </button>
          )}
        </div>
      </form>
      </div>
    </FormContext.Provider>
  );
}
