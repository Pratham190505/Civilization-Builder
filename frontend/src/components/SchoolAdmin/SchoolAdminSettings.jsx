import { useState, useEffect } from "react";
import { User, Lock, Palette, Bell, Share2, Shield, Camera, Eye, EyeOff, Sun, Moon, Monitor, BookOpen } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.jsx";
import { getSchoolAnalytics } from "../../api/analytics";
import { getSchoolById, updateSchool } from "../../api/schools";
import { toast } from "sonner";

const tabs = [
  { id: "profile", label: "Admin Profile", icon: User },
  { id: "schoolProfile", label: "School Profile", icon: BookOpen },
  { id: "password", label: "Password", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} className="relative w-11 h-6 rounded-full transition-all border-0 cursor-pointer"
      style={{ background: value ? "#4f7fff" : "rgba(255,255,255,0.12)" }}>
      <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
        style={{ left: value ? "24px" : "4px" }} />
    </button>
  );
}

import { updateProfile, changePassword } from "../../api/auth";

export default function SchoolAdminSettings({ darkMode, onToggleDark }) {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPass, setShowPass] = useState(false);
  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem("notifs_school_admin");
    return saved ? JSON.parse(saved) : { email: true, push: true, sms: false, weekly: true, monthly: true, instant: false };
  });
  const [schoolData, setSchoolData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    localStorage.setItem("notifs_school_admin", JSON.stringify(notifs));
  }, [notifs]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // School profile details
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [principalQualification, setPrincipalQualification] = useState("");
  const [principalEmail, setPrincipalEmail] = useState("");
  const [principalMobile, setPrincipalMobile] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isRanked, setIsRanked] = useState(false);

  const schoolId = user?.scope?.schoolId || 1;

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setMobile(user.mobile || "");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="grid h-48 place-items-center bg-transparent text-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }


  useEffect(() => {
    async function loadProfile() {
      try {
        setLoadingProfile(true);
        const [analyticsRes, schoolRes] = await Promise.all([
          getSchoolAnalytics(schoolId),
          getSchoolById(schoolId)
        ]);
        if (analyticsRes.success) {
          setSchoolData(analyticsRes.data);
        }
        if (schoolRes.success && schoolRes.data) {
          const s = schoolRes.data;
          setIsRanked(s.inspection_status === 'COMPLETED' && s.tier_id !== null);
          setSchoolAddress(s.address || "");
          setSchoolPhone(s.mobile || s.phone || "");
          setSchoolEmail(s.email || "");
          setPrincipalName(s.principal_name || "");
          setPrincipalQualification(s.principal_qualification || "");
          setPrincipalEmail(s.principal_email || "");
          setPrincipalMobile(s.principal_mobile || "");
          setFacebookUrl(s.facebook_url || "");
          setInstagramUrl(s.instagram_url || "");
          setYoutubeUrl(s.youtube_url || "");
          setWebsiteUrl(s.website_url || "");
        }
      } catch (err) {
        console.error("Failed to load school details:", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    if (user) {
      loadProfile();
    }
  }, [user, schoolId]);

  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardShadow = darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)";
  const textPrimary = darkMode ? "#e2e8f0" : "#0f172a";
  const textMuted = darkMode ? "#8892a4" : "#64748b";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const inputBorder = darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)";

  const handleSaveProfile = async () => {
    try {
      const res = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        mobile: mobile,
      });
      if (res.success) {
        toast.success("Profile saved successfully!");
      } else {
        toast.error(res.message || "Failed to save profile");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Error saving profile");
    }
  };

  const handleSaveSchoolProfile = async () => {
    const fbRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+$/i;
    const igRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/i;
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i;
    const webRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i;

    if (isRanked) {
      if (!facebookUrl) {
        toast.error("Facebook URL is required after ranking");
        return;
      }
      if (!instagramUrl) {
        toast.error("Instagram URL is required after ranking");
        return;
      }
      if (!youtubeUrl) {
        toast.error("YouTube URL is required after ranking");
        return;
      }
    }

    if (facebookUrl && !fbRegex.test(facebookUrl)) {
      toast.error("Invalid Facebook Page URL (must contain facebook.com or fb.com)");
      return;
    }
    if (instagramUrl && !igRegex.test(instagramUrl)) {
      toast.error("Invalid Instagram Profile URL (must contain instagram.com)");
      return;
    }
    if (youtubeUrl && !ytRegex.test(youtubeUrl)) {
      toast.error("Invalid YouTube Channel URL (must contain youtube.com or youtu.be)");
      return;
    }
    if (websiteUrl && !webRegex.test(websiteUrl)) {
      toast.error("Invalid Website URL format");
      return;
    }

    try {
      const payload = {
        address: schoolAddress,
        mobile: schoolPhone,
        email: schoolEmail,
        principal_name: principalName,
        principal_qualification: principalQualification,
        principal_email: principalEmail,
        principal_mobile: principalMobile,
        facebook_url: facebookUrl,
        instagram_url: instagramUrl,
        youtube_url: youtubeUrl,
        website_url: websiteUrl
      };
      
      const res = await updateSchool(schoolId, payload);
      if (res.success) {
        toast.success("School Profile saved successfully!");
      } else {
        toast.error(res.message || "Failed to save school profile");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Error saving school profile");
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.message || "Failed to update password");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Error updating password");
    }
  };

  const userInitials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "SA"
    : "SA";
  const userFullName = user
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : "School Admin";
  const userEmail = user?.email || "abc@gdschool.in";

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
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-all border-0 cursor-pointer text-left"
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
          <div key={schoolData ? "loaded" : "loading"}>
            <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>Profile Settings</h3>
            <p className="text-sm mb-6" style={{ color: textMuted }}>Update your personal and school details.</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-white"
                  style={{ background: "linear-gradient(135deg, #4f7fff, #8b5cf6)" }}>{userInitials}</div>
              </div>
              <div>
                <div className="font-semibold" style={{ color: textPrimary }}>{userFullName}</div>
                <div className="text-sm" style={{ color: textMuted }}>{userEmail}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>Mobile Number</label>
                <input value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>Email Address</label>
                <input value={userEmail} disabled className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all opacity-70 cursor-not-allowed"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>School Name</label>
                <input value={schoolData?.school_name || "ABC International School"} disabled className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all opacity-70 cursor-not-allowed"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>State</label>
                <input value={schoolData?.District?.State?.state_name || "Gujarat"} disabled className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all opacity-70 cursor-not-allowed"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              className="mt-6 px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-80 border-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #4f7fff, #8b5cf6)", color: "#fff" }}>
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "schoolProfile" && (
          <div>
            <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>School Profile Settings</h3>
            <p className="text-sm mb-6" style={{ color: textMuted }}>Update public profile details and social media links for verification.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>School Address</label>
                <textarea rows={2} value={schoolAddress} onChange={e => setSchoolAddress(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm resize-none transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>School Phone / Mobile</label>
                <input value={schoolPhone} onChange={e => setSchoolPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>School Email</label>
                <input value={schoolEmail} onChange={e => setSchoolEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>Principal Name</label>
                <input value={principalName} onChange={e => setPrincipalName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>Principal Qualification</label>
                <input value={principalQualification} onChange={e => setPrincipalQualification(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>Principal Email</label>
                <input value={principalEmail} onChange={e => setPrincipalEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>Principal Mobile</label>
                <input value={principalMobile} onChange={e => setPrincipalMobile(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>

              <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold mb-3 text-slate-200">Social Media & Websites</h4>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>Facebook Page URL</label>
                <input value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  placeholder="https://facebook.com/yourschool"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>Instagram Profile URL</label>
                <input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  placeholder="https://instagram.com/yourschool"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>YouTube Channel URL</label>
                <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  placeholder="https://youtube.com/c/yourschool"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>Website URL</label>
                <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all"
                  placeholder="https://yourschool.edu.in"
                  style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
              </div>
            </div>
            
            <button
              onClick={handleSaveSchoolProfile}
              className="mt-6 px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-80 border-0 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #4f7fff, #8b5cf6)", color: "#fff" }}>
              Save School Profile
            </button>
          </div>
        )}


        {activeTab === "password" && (
          <div>
            <h3 className="font-semibold mb-1" style={{ color: textPrimary }}>Change Password</h3>
            <p className="text-sm mb-6" style={{ color: textMuted }}>Update your account password securely.</p>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>Current Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} placeholder="••••••••"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl outline-none text-sm pr-10"
                    style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent cursor-pointer" style={{ color: textMuted }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>New Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl outline-none text-sm pr-10"
                    style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: textMuted }}>Confirm New Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl outline-none text-sm pr-10"
                    style={{ background: inputBg, border: inputBorder, color: textPrimary }} />
                </div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "rgba(79,127,255,0.08)", border: "1px solid rgba(79,127,255,0.15)" }}>
                <p className="text-xs" style={{ color: "#4f7fff" }}>Password must be at least 6 characters long.</p>
              </div>
              <button onClick={handleUpdatePassword} className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-80 border-0 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #4f7fff, #8b5cf6)", color: "#fff" }}>
                Update Password
              </button>
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


      </div>
    </div>
  );
}
