export const statesData = [
  { state: "Maharashtra", admin: "Rajesh Sharma", total: 212, active: 178, pending: 8, tier: "Platinum" },
  { state: "Gujarat", admin: "Meera Patel", total: 124, active: 96, pending: 5, tier: "Gold" },
  { state: "Uttar Pradesh", admin: "Amit Kumar", total: 156, active: 102, pending: 14, tier: "Bronze" },
  { state: "Rajasthan", admin: "Priya Singh", total: 88, active: 63, pending: 6, tier: "Silver" },
  { state: "Karnataka", admin: "Suresh Nair", total: 104, active: 88, pending: 3, tier: "Gold" },
  { state: "Tamil Nadu", admin: "Lakshmi Iyer", total: 78, active: 66, pending: 2, tier: "Platinum" },
  { state: "West Bengal", admin: "Debasis Roy", total: 90, active: 74, pending: 7, tier: "Bronze" },
  { state: "Bihar", admin: "Rajan Prasad", total: 72, active: 58, pending: 4, tier: "Silver" },
  { state: "Madhya Pradesh", admin: "Kavita Joshi", total: 118, active: 90, pending: 10, tier: "Silver" },
  { state: "Punjab", admin: "Harpreet Kaur", total: 44, active: 38, pending: 1, tier: "Bronze" },
];

export const regionalAdmins = [
  { initials: "RS", name: "Rajesh Sharma", state: "Maharashtra", schools: 212, email: "rajesh@gds.in", status: "Active", color: "from-blue-500 to-blue-600" },
  { initials: "MP", name: "Meera Patel", state: "Gujarat", schools: 124, email: "meera@gds.in", status: "Active", color: "from-emerald-500 to-emerald-600" },
  { initials: "AK", name: "Amit Kumar", state: "Uttar Pradesh", schools: 156, email: "amit@gds.in", status: "Active", color: "from-violet-500 to-violet-600" },
  { initials: "PS", name: "Priya Singh", state: "Rajasthan", schools: 88, email: "priya@gds.in", status: "Suspended", color: "from-rose-500 to-rose-600" },
  { initials: "SN", name: "Suresh Nair", state: "Karnataka", schools: 104, email: "suresh@gds.in", status: "Active", color: "from-amber-500 to-amber-600" },
  { initials: "LI", name: "Lakshmi Iyer", state: "Tamil Nadu", schools: 78, email: "lakshmi@gds.in", status: "Active", color: "from-teal-500 to-teal-600" },
  { initials: "DR", name: "Debasis Roy", state: "West Bengal", schools: 90, email: "debasis@gds.in", status: "Active", color: "from-pink-500 to-pink-600" },
  { initials: "RP", name: "Rajan Prasad", state: "Bihar", schools: 72, email: "rajan@gds.in", status: "Inactive", color: "from-fuchsia-500 to-fuchsia-600" },
];

export const schoolsData = [
  { name: "GDS Ahmedabad", state: "Gujarat", city: "Ahmedabad", regional: "Meera Patel", admin: "Vivek Shah", status: "Active", ranking: "Platinum", social: "Connected" },
  { name: "GDS Mumbai", state: "Maharashtra", city: "Mumbai", regional: "Rajesh Sharma", admin: "Sneha More", status: "Active", ranking: "Gold", social: "Connected" },
  { name: "GDS Pune", state: "Maharashtra", city: "Pune", regional: "Rajesh Sharma", admin: "Arjun Deshpande", status: "Active", ranking: "Platinum", social: "Connected" },
  { name: "GDS Jaipur", state: "Rajasthan", city: "Jaipur", regional: "Priya Singh", admin: "Mohan Verma", status: "Inactive", ranking: "Silver", social: "Pending" },
  { name: "GDS Lucknow", state: "Uttar Pradesh", city: "Lucknow", regional: "Amit Kumar", admin: "Rahul Gupta", status: "Active", ranking: "Bronze", social: "Connected" },
  { name: "GDS Vadodara", state: "Gujarat", city: "Vadodara", regional: "Meera Patel", admin: "Kiran Desai", status: "Active", ranking: "Gold", social: "Connected" },
  { name: "GDS Borivali", state: "Maharashtra", city: "Mumbai", regional: "Rajesh Sharma", admin: "Nilesh Patil", status: "Pending", ranking: "Unranked", social: "Pending" },
  { name: "GDS Surat", state: "Gujarat", city: "Surat", regional: "Meera Patel", admin: "Hemal Solanki", status: "Active", ranking: "Silver", social: "Connected" },
  { name: "GDS Indore", state: "Madhya Pradesh", city: "Indore", regional: "Kavita Joshi", admin: "Anil Verma", status: "Pending", ranking: "Unranked", social: "Pending" },
  { name: "GDS Bengaluru", state: "Karnataka", city: "Bengaluru", regional: "Suresh Nair", admin: "Preethi Rao", status: "Active", ranking: "Gold", social: "Connected" },
];

export const mediaApprovals = [
  { school: "GDS Vadodara", state: "Gujarat", uploader: "Kiran Desai", caption: "Annual sports day highlights 2026", date: "10 Jun 2026", status: "Pending" },
  { school: "GDS Borivali", state: "Maharashtra", uploader: "Nilesh Patil", caption: "Science exhibition showcase", date: "09 Jun 2026", status: "Pending" },
  { school: "GDS Jaipur", state: "Rajasthan", uploader: "Mohan Verma", caption: "Cultural program reel", date: "08 Jun 2026", status: "Needs Review" },
  { school: "GDS Lucknow", state: "Uttar Pradesh", uploader: "Rahul Gupta", caption: "Independence Day celebration", date: "07 Jun 2026", status: "Pending" },
  { school: "GDS Surat", state: "Gujarat", uploader: "Hemal Solanki", caption: "GDS Achievers spotlight", date: "06 Jun 2026", status: "Pending" },
  { school: "GDS Bengaluru", state: "Karnataka", uploader: "Preethi Rao", caption: "Tech fest 2026 highlights", date: "05 Jun 2026", status: "Needs Review" },
];

export const rankingsData = [
  { rank: 1, school: "GDS Ahmedabad", state: "Gujarat", score: 98, tier: "Platinum" },
  { rank: 2, school: "GDS Pune", state: "Maharashtra", score: 96, tier: "Platinum" },
  { rank: 3, school: "GDS Tamil Nadu", state: "Chennai", score: 94, tier: "Gold" },
  { rank: 4, school: "GDS Mumbai", state: "Maharashtra", score: 91, tier: "Gold" },
  { rank: 5, school: "GDS Bengaluru", state: "Karnataka", score: 89, tier: "Gold" },
  { rank: 6, school: "GDS Surat", state: "Gujarat", score: 84, tier: "Silver" },
  { rank: 7, school: "GDS Jaipur", state: "Rajasthan", score: 78, tier: "Silver" },
  { rank: 8, school: "GDS Lucknow", state: "Uttar Pradesh", score: 62, tier: "Bronze" },
  { rank: 9, school: "GDS Indore", state: "Madhya Pradesh", score: 55, tier: "Unranked" },
  { rank: 10, school: "GDS Patna", state: "Bihar", score: 48, tier: "Unranked" },
];

export const notifications = [
  { id: 1, icon: "plus", tone: "green", title: "New school added by Gujarat Regional Admin", body: "GDS Surat has been added and is awaiting approval.", time: "2 min ago", badge: "Action Required", unread: true },
  { id: 2, icon: "media", tone: "amber", title: "GDS Vadodara uploaded new reel", body: "New media is pending approval in the Media Center.", time: "8 min ago", badge: "Action Required", unread: true },
  { id: 3, icon: "trophy", tone: "violet", title: "GDS Pune upgraded to Platinum", body: "Ranking updated automatically based on performance score.", time: "1 hr ago", badge: "Info", unread: true },
  { id: 4, icon: "x", tone: "red", title: "Media rejected notice sent to GDS Jaipur", body: "Rejection reason: Logo missing, low quality video.", time: "2 hr ago", badge: "Info", unread: false },
  { id: 5, icon: "building", tone: "blue", title: "Maharashtra region added 4 new schools", body: "GDS Nagpur, GDS Nashik, GDS Aurangabad, GDS Solapur added.", time: "3 hr ago", badge: "Info", unread: false },
  { id: 6, icon: "plus", tone: "violet", title: "GDS Indore approval pending", body: "New school request from Madhya Pradesh Regional Admin.", time: "5 hr ago", badge: "Action Required", unread: false },
  { id: 7, icon: "bell", tone: "muted", title: "Super Admin login session started", body: "Login from IP 192.168.1.1 — Delhi, India.", time: "6 hr ago", badge: "Info", unread: false },
];

export const conversations = [
  { id: 1, initials: "RS", name: "Rajesh Sharma", role: "Maharashtra Regional Admin", preview: "GDS Nagpur approval is pending", time: "5m", unread: 2, color: "from-blue-500 to-blue-600" },
  { id: 2, initials: "MP", name: "Meera Patel", role: "Gujarat Regional Admin", preview: "New reels submitted by GDS Surat team", time: "22m", unread: 0, color: "from-emerald-500 to-emerald-600" },
  { id: 3, initials: "AK", name: "Amit Kumar", role: "Uttar Pradesh Regional Admin", preview: "Requesting extension for school onboarding", time: "1h", unread: 1, color: "from-violet-500 to-violet-600" },
  { id: 4, initials: "A", name: "All School Admins", role: "Broadcast group", preview: "Brand guidelines update for June 2026", time: "2h", unread: 0, color: "from-amber-500 to-amber-600" },
  { id: 5, initials: "PS", name: "Priya Singh", role: "Rajasthan Regional Admin", preview: "Media quality improvement plan submitted", time: "1d", unread: 0, color: "from-rose-500 to-rose-600" },
];

export const messageThread = [
  { from: "them", text: "GDS Nagpur approval is pending since 3 days. Please review.", time: "10:20 AM" },
  { from: "me", text: "Reviewing now. Will approve by EOD today.", time: "10:22 AM" },
  { from: "them", text: "Thank you! Also 2 new schools are awaiting onboarding.", time: "10:25 AM" },
];

export const permissionMatrix = [
  { feature: "View Dashboard", super: true, regional: true, school: true },
  { feature: "Add School", super: true, regional: true, school: false },
  { feature: "Approve School", super: true, regional: false, school: false },
  { feature: "Upload Media", super: true, regional: true, school: true },
  { feature: "Approve Media", super: true, regional: false, school: false },
  { feature: "Reject Media", super: true, regional: false, school: false },
  { feature: "Assign Ranking", super: true, regional: false, school: false },
  { feature: "Login as User", super: true, regional: false, school: false },
  { feature: "View Analytics", super: true, regional: true, school: false },
  { feature: "Manage Permissions", super: true, regional: false, school: false },
];

export const auditLogs = [
  { id: "LOG-2041", action: "Approved media reel", actor: "Anurag Admin", target: "GDS Pune", time: "12 Jun 2026 · 10:42", ip: "192.168.1.21" },
  { id: "LOG-2040", action: "Created regional admin", actor: "Anurag Admin", target: "Karnataka", time: "12 Jun 2026 · 09:30", ip: "192.168.1.21" },
  { id: "LOG-2039", action: "Rejected media", actor: "Rajesh Sharma", target: "GDS Borivali", time: "11 Jun 2026 · 18:11", ip: "10.0.4.55" },
  { id: "LOG-2038", action: "Updated ranking", actor: "System", target: "GDS Ahmedabad → Platinum", time: "11 Jun 2026 · 16:02", ip: "—" },
  { id: "LOG-2037", action: "Login", actor: "Meera Patel", target: "Regional Dashboard", time: "11 Jun 2026 · 09:01", ip: "10.0.6.12" },
  { id: "LOG-2036", action: "Disabled account", actor: "Anurag Admin", target: "Priya Singh", time: "10 Jun 2026 · 17:48", ip: "192.168.1.21" },
  { id: "LOG-2035", action: "Added school", actor: "Amit Kumar", target: "GDS Allahabad", time: "10 Jun 2026 · 13:30", ip: "10.0.8.7" },
];

export const analyticsTrend = [
  { month: "Jan", uploads: 320, approvals: 280, rejections: 30 },
  { month: "Feb", uploads: 380, approvals: 340, rejections: 32 },
  { month: "Mar", uploads: 460, approvals: 410, rejections: 41 },
  { month: "Apr", uploads: 520, approvals: 470, rejections: 38 },
  { month: "May", uploads: 540, approvals: 490, rejections: 44 },
  { month: "Jun", uploads: 600, approvals: 540, rejections: 50 },
  { month: "Jul", uploads: 620, approvals: 565, rejections: 48 },
];

export const activeTrend = [
  { month: "Jan", active: 820 },
  { month: "Feb", active: 860 },
  { month: "Mar", active: 890 },
  { month: "Apr", active: 920 },
  { month: "May", active: 950 },
  { month: "Jun", active: 970 },
  { month: "Jul", active: 986 },
];

export const stateActive = [
  { state: "Maharashtra", active: 178 },
  { state: "Karnataka", active: 88 },
  { state: "Gujarat", active: 96 },
  { state: "Tamil Nadu", active: 66 },
  { state: "Madhya Pradesh", active: 90 },
  { state: "UP", active: 102 },
];

export const topPerformers = [
  { rank: 1, name: "GDS Ahmedabad", score: 98, tier: "Platinum" },
  { rank: 2, name: "GDS Pune", score: 96, tier: "Platinum" },
  { rank: 3, name: "GDS Chennai", score: 94, tier: "Gold" },
  { rank: 4, name: "GDS Mumbai", score: 91, tier: "Gold" },
  { rank: 5, name: "GDS Bengaluru", score: 89, tier: "Gold" },
];

export const lowPerformers = [
  { name: "GDS Patna", note: "Low activity", score: 48 },
  { name: "GDS Allahabad", note: "No uploads", score: 52 },
  { name: "GDS Jhansi", note: "Inactive admin", score: 55 },
];
