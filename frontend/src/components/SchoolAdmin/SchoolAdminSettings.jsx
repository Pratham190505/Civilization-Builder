import { useState } from "react";
import { User, Lock, Palette, Bell, Share2, Shield, Camera, Eye, EyeOff, Sun, Moon, Monitor } from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "social", label: "Social Media API", icon: Share2 },
  { id: "security", label: "Security", icon: Shield },
];

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} className="relative w-11 h-6 rounded-full transition-all"
      style={{ background: value ? "#4f7fff" : "rgba(255,255,255,0.12)" }}>
      <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
        style={{ left: value ? "24px" : "4px" }} />
    </button>
  );
}

export default function SchoolAdminSettings({ darkMode, onToggleDark }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPass, setShowPass] = useState(false);
  const [notifs, setNotifs] = useState({ email: true, push: true, sms: false, weekly: true, monthly: true, instant: false });
  const [twoFA, setTwoFA] = useState(false);

  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const inputBorder = darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)";

  function InputField({ label, defaultValue, type = "text" }) {
    return (
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>{label}</label>
        <input defaultValue={defaultValue} type={type} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
          style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {/* Tabs */}
      <div className="w-48 flex-shrink-0">
        <div className="rounded-2xl p-2" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-all"
                style={{
                  background: isActive ? "rgba(79,127,255,0.12)" : "transparent",
                  color: isActive ? "#4f7fff" : textMuted,
                  border: isActive ? "1px solid rgba(79,127,255,0.2)" : "1px solid transparent",
                }}>
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 rounded-2xl p-6" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        {activeTab === "profile" && (
          <div>
            <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>Profile Settings</h3>
            <p className="text-sm mb-6" style={{ color: textMuted }}>Update your school and personal information.</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-white"
                  style={{ background: "linear-gradient(135deg, #4f7fff, #8b5cf6)" }}>SA</div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "#4f7fff" }}>
                  <Camera size={11} className="text-white" />
                </button>
              </div>
              <div>
                <div className="font-semibold" style={{ color: textPrimary }}>School Admin</div>
                <div className="text-sm" style={{ color: textMuted }}>abc@gdschool.in</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="School Name" defaultValue="ABC International School" />
              <InputField label="Principal Name" defaultValue="John Smith" />
              <InputField label="Email Address" defaultValue="admin@gdschool.in" type="email" />
              <InputField label="Phone Number" defaultValue="+91-79614-42250" />
              <InputField label="City" defaultValue="Ahmedabad" />
              <InputField label="State" defaultValue="Gujarat" />
              <div className="md:col-span-2">
                <InputField label="Address" defaultValue="123 Education Street, Gujarat - 380001" />
              </div>
            </div>
            <button className="mt-6 px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-80"
              style={{ background: "linear-gradient(135deg, #4f7fff, #8b5cf6)", color: "#fff" }}>
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "password" && (
          <div>
            <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>Change Password</h3>
            <p className="text-sm mb-6" style={{ color: textMuted }}>Update your account password securely.</p>
            <div className="space-y-4 max-w-md">
              {["Current Password", "New Password", "Confirm New Password"].map((label, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>{label}</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl outline-none text-sm pr-10"
                      style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
                    <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="p-3 rounded-xl" style={{ background: "rgba(79,127,255,0.08)", border: "1px solid rgba(79,127,255,0.15)" }}>
                <p className="text-xs" style={{ color: "#4f7fff" }}>Password must be at least 8 characters with uppercase, number, and special character.</p>
              </div>
              <button className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-80"
                style={{ background: "linear-gradient(135deg, #4f7fff, #8b5cf6)", color: "#fff" }}>
                Update Password
              </button>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div>
            <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>Appearance</h3>
            <p className="text-sm mb-6" style={{ color: textMuted }}>Customize the look and feel of your dashboard.</p>
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3" style={{ color: textPrimary }}>Theme Mode</h4>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map(t => {
                  const isActive = (t.id === "dark") === darkMode;
                  return (
                    <button key={t.id} onClick={() => { if ((t.id === "dark") !== darkMode) onToggleDark(); }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                      style={{
                        background: isActive ? "rgba(79,127,255,0.12)" : darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                        border: isActive ? "1px solid rgba(79,127,255,0.3)" : (darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)"),
                      }}>
                      <t.icon size={20} style={{ color: isActive ? "#4f7fff" : textMuted }} />
                      <span className="text-sm" style={{ color: isActive ? "#4f7fff" : textMuted }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3" style={{ color: textPrimary }}>Accent Color</h4>
              <div className="flex gap-2">
                {["#4f7fff", "#8b5cf6", "#22d3ee", "#34d399", "#f59e0b", "#ef4444"].map(c => (
                  <button key={c} className="w-8 h-8 rounded-full transition-all hover:scale-110"
                    style={{ background: c, border: c === "#4f7fff" ? "3px solid white" : "none" }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>Notification Preferences</h3>
            <p className="text-sm mb-6" style={{ color: textMuted }}>Control how and when you receive notifications.</p>
            <div className="space-y-4">
              {[
                { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                { key: "sms", label: "SMS Notifications", desc: "Receive SMS for critical alerts" },
                { key: "weekly", label: "Weekly Digest", desc: "Weekly summary report" },
                { key: "monthly", label: "Monthly Report", desc: "Monthly performance report" },
                { key: "instant", label: "Instant Alerts", desc: "Real-time approval notifications" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between py-3"
                  style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)" }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: textPrimary }}>{n.label}</div>
                    <div className="text-xs" style={{ color: textMuted }}>{n.desc}</div>
                  </div>
                  <Toggle value={notifs[n.key]} onChange={v => setNotifs(prev => ({ ...prev, [n.key]: v }))} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div>
            <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>Social Media API</h3>
            <p className="text-sm mb-6" style={{ color: textMuted }}>Connect your school's social media accounts for auto-sharing.</p>
            <div className="space-y-4">
              {[
                { platform: "YouTube", color: "#ef4444", placeholder: "AIzaSyXXXXXXXXXXXXXXXXXXXXXX" },
                { platform: "Instagram", color: "#8b5cf6", placeholder: "IGXXXXXXXXXXXXXXXXXXXXXXXX" },
                { platform: "Facebook", color: "#4f7fff", placeholder: "EAAGXXXXXXXXXXXXXXXXXXXXXXXX" },
                { platform: "Twitter/X", color: "#22d3ee", placeholder: "AAAAAAAAAAAXXXXXXXXXXXXXXXXXX" },
              ].map((s) => (
                <div key={s.platform} className="p-4 rounded-xl" style={{ background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: inputBorder }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full" style={{ background: s.color }} />
                    <span className="font-medium text-sm" style={{ color: textPrimary }}>{s.platform}</span>
                  </div>
                  <input placeholder={`${s.platform} API Key: ${s.placeholder}`} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                    style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
                </div>
              ))}
              <button className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-80"
                style={{ background: "linear-gradient(135deg, #4f7fff, #8b5cf6)", color: "#fff" }}>
                Save API Keys
              </button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div>
            <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>Security Settings</h3>
            <p className="text-sm mb-6" style={{ color: textMuted }}>Manage your account security and access settings.</p>
            <div className="space-y-4">
              <div className="p-4 rounded-xl flex items-center justify-between"
                style={{ background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: inputBorder }}>
                <div>
                  <div className="font-medium text-sm" style={{ color: textPrimary }}>Two-Factor Authentication</div>
                  <div className="text-xs mt-0.5" style={{ color: textMuted }}>Add an extra layer of security to your account</div>
                </div>
                <Toggle value={twoFA} onChange={setTwoFA} />
              </div>
              <div className="p-4 rounded-xl" style={{ background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: inputBorder }}>
                <div className="font-medium text-sm mb-3" style={{ color: textPrimary }}>Active Sessions</div>
                {[
                  { device: "Chrome · Windows 11", location: "Ahmedabad, IN", time: "Current session", current: true },
                  { device: "Safari · iPhone 14", location: "Ahmedabad, IN", time: "2 days ago", current: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i === 0 ? (darkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)") : "none" }}>
                    <div>
                      <div className="text-sm" style={{ color: textPrimary }}>{s.device}</div>
                      <div className="text-xs" style={{ color: textMuted }}>{s.location} · {s.time}</div>
                    </div>
                    {s.current ? (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>Active</span>
                    ) : (
                      <button className="text-xs px-2 py-0.5 rounded-full transition-all hover:opacity-70" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>Revoke</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <div className="font-medium text-sm mb-2" style={{ color: "#ef4444" }}>Danger Zone</div>
                <button className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
