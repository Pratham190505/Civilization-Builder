import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  Palette,
  Check,
  CheckCircle2
} from "lucide-react";

const menuItems = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    description: "Manage your personal information",
  },
  {
    id: "password",
    label: "Change Password",
    icon: Lock,
    description: "Update your account security",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Configure alert preferences",
  },
  {
    id: "theme",
    label: "Appearance",
    icon: Palette,
    description: "Customize the interface",
  },
];

const cardStyle = {
  background: "var(--glass-card)",
  border: "1px solid var(--glass-border)",
  backdropFilter: "blur(20px)",
  boxShadow: "var(--card-shadow)",
};

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

export default function Settings({ darkMode, onToggleDark }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [showSuccess, setShowSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "State Admin",
    email: "admin@gujarat.gov.in",
    phone: "+91 79 2354 6789",
    role: "State Administrator",
    state: "Gujarat",
  });

  const [notificationsData, setNotificationsData] = useState({
    email: true,
    inspection: true,
    media: false,
    school: true,
  });

  const [appearanceTheme, setAppearanceTheme] = useState(darkMode ? "dark" : "light");

  const triggerSuccessBanner = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Scoped Switch Toggle Component
  function Switch({ checked, onChange, label, desc }) {
    return (
      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{
          background: "var(--glass-hover)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div>
          <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {label}
          </div>
          {desc && (
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {desc}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className="w-11 h-6 rounded-full transition-all relative cursor-pointer"
          style={{
            background: checked
              ? "linear-gradient(135deg, #3B82F6, #6366F1)"
              : "var(--glass-card)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
            style={{
              left: checked ? "calc(100% - 22px)" : "2px",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.3)",
            }}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 regional-admin-theme pb-8">
      {/* 1. Header Title */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Settings
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Manage your account and preferences
        </p>
      </div>

      {/* 2. Success Banner */}
      {showSuccess && (
        <div
          className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in"
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span className="text-sm font-semibold" style={{ color: "#10B981" }}>
            Settings saved successfully!
          </span>
        </div>
      )}

      {/* 3. Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side Settings Menu Tabs */}
        <div className="rounded-2xl p-2 h-fit" style={cardStyle}>
          {menuItems.map((item) => {
            const TabIcon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all cursor-pointer group"
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15))",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                      }
                    : { background: "transparent", border: "1px solid transparent" }
                }
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: isActive ? "rgba(59, 130, 246, 0.2)" : "var(--glass-hover)",
                  }}
                >
                  <TabIcon
                    className="w-4 h-4 transition-transform group-hover:scale-110"
                    style={{ color: isActive ? "#3B82F6" : "var(--text-muted)" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-bold"
                    style={{
                      color: isActive ? "#3B82F6" : "var(--text-primary)",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side Settings Panels */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Panel */}
          {activeTab === "profile" && (
            <div className="rounded-2xl p-6 animate-fade-in" style={cardStyle}>
              <h3 className="text-sm font-bold mb-5" style={{ color: "var(--text-primary)" }}>
                Profile Information
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  SA
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {profileData.name}
                  </div>
                  <div className="text-xs mt-0.5 font-medium" style={{ color: "var(--text-muted)" }}>
                    {profileData.role}
                  </div>
                  <button className="text-xs font-semibold mt-1 cursor-pointer" style={{ color: "#3B82F6" }}>
                    Change Photo
                  </button>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", key: "name", placeholder: "State Admin" },
                  { label: "Email Address", key: "email", type: "email", placeholder: "admin@gujarat.gov.in" },
                  { label: "Phone Number", key: "phone", type: "tel", placeholder: "+91 79 2354 6789" },
                  { label: "Role", key: "role", placeholder: "State Administrator" },
                  { label: "State", key: "state", placeholder: "Gujarat" },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label style={labelStyle} className="font-semibold">{field.label}</label>
                    <input
                      type={field.type || "text"}
                      value={profileData[field.key]}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[#6C63FF]/20"
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={triggerSuccessBanner}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Change Password Panel */}
          {activeTab === "password" && (
            <div className="rounded-2xl p-6 animate-fade-in" style={cardStyle}>
              <h3 className="text-sm font-bold mb-5" style={{ color: "var(--text-primary)" }}>
                Change Password
              </h3>
              <div className="space-y-4 max-w-md">
                {[
                  { label: "Current Password", placeholder: "Enter current password" },
                  { label: "New Password", placeholder: "Enter new password" },
                  { label: "Confirm New Password", placeholder: "Confirm new password" },
                ].map((field) => (
                  <div key={field.label} className="space-y-1.5">
                    <label style={labelStyle} className="font-semibold">{field.label}</label>
                    <input
                      type="password"
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[#6C63FF]/20"
                      style={inputStyle}
                    />
                  </div>
                ))}

                <div
                  className="p-3.5 rounded-xl text-xs"
                  style={{
                    background: "rgba(59, 130, 246, 0.05)",
                    border: "1px solid rgba(59, 130, 246, 0.15)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Password must be at least 8 characters with uppercase, lowercase, numbers and symbols.
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={triggerSuccessBanner}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* Notifications Preferences Panel */}
          {activeTab === "notifications" && (
            <div className="rounded-2xl p-6 space-y-4 animate-fade-in" style={cardStyle}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Notification Preferences
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Configure what updates you receive alerts for
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Switch
                  checked={notificationsData.email}
                  onChange={(val) => setNotificationsData((p) => ({ ...p, email: val }))}
                  label="Email Alerts"
                  desc="Receive important updates via email"
                />
                <Switch
                  checked={notificationsData.inspection}
                  onChange={(val) => setNotificationsData((p) => ({ ...p, inspection: val }))}
                  label="Inspection Alerts"
                  desc="Get notified when inspection status changes"
                />
                <Switch
                  checked={notificationsData.media}
                  onChange={(val) => setNotificationsData((p) => ({ ...p, media: val }))}
                  label="Media Upload Alerts"
                  desc="Notifications for video approvals and uploads"
                />
                <Switch
                  checked={notificationsData.school}
                  onChange={(val) => setNotificationsData((p) => ({ ...p, school: val }))}
                  label="School Registration Alerts"
                  desc="Alerts when new schools are registered"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={triggerSuccessBanner}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                  }}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Appearance Theme Switcher Panel */}
          {activeTab === "theme" && (
            <div className="rounded-2xl p-6 animate-fade-in" style={cardStyle}>
              <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                Appearance
              </h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Choose your preferred color theme for the interface
              </p>

              <div className="grid grid-cols-3 gap-4 max-w-md">
                {["light", "dark"].map((themeVal) => {
                  const isActive = appearanceTheme === themeVal;

                  return (
                    <button
                      key={themeVal}
                      onClick={() => {
                        setAppearanceTheme(themeVal);
                        if (themeVal === "dark" && !darkMode) onToggleDark();
                        if (themeVal === "light" && darkMode) onToggleDark();
                      }}
                      className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all cursor-pointer relative"
                      style={{
                        background: isActive ? "rgba(59, 130, 246, 0.1)" : "var(--glass-hover)",
                        border: isActive ? "2px solid #3B82F6" : "1px solid var(--glass-border)",
                      }}
                    >
                      {/* Theme Thumbnail mockup */}
                      <div
                        className="w-full h-12 rounded-lg overflow-hidden relative"
                        style={{
                          background: themeVal === "dark" ? "#0b0f1c" : "#f3f7fd",
                        }}
                      >
                        <div
                          className="w-2/3 h-2.5 mt-2 ml-2 rounded"
                          style={{
                            background: themeVal === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                          }}
                        />
                        <div
                          className="w-1/2 h-2 mt-1.5 ml-2 rounded"
                          style={{
                            background: themeVal === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                          }}
                        />
                      </div>
                      <div
                        className="text-xs capitalize font-semibold"
                        style={{
                          color: isActive ? "#3B82F6" : "var(--text-secondary)",
                        }}
                      >
                        {themeVal} Mode
                      </div>
                      {isActive && (
                        <div
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center bg-[#3B82F6]"
                        >
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scope details note */}
              <div
                className="mt-6 p-4 rounded-xl text-xs"
                style={{
                  background: "var(--glass-hover)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <div className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  Glassmorphism Effects
                </div>
                <div style={{ color: "var(--text-muted)" }}>
                  Dark Mode: Blur 20px, Blue glow, Neon accents · Light Mode: Blur 10px, Soft shadows, White cards
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
