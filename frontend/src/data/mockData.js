export const stats = [
  { key: "total", label: "Total Schools", value: "1,248", sub: "29 STATES", delta: "+12", trend: "up", tone: "blue", icon: "building" },
  { key: "active", label: "Active Schools", value: "986", sub: "79% RATE", delta: "+2.4%", trend: "up", tone: "green", icon: "check" },
  { key: "pending", label: "Pending", value: "143", sub: "NEED REVIEW", delta: "-8", trend: "down", tone: "amber", icon: "clock" },
  { key: "approved", label: "Approved Media", value: "8,420", sub: "TOTAL REELS", delta: "+18%", trend: "up", tone: "violet", icon: "film" },
  { key: "rejected", label: "Rejected", value: "326", sub: "WITH NOTICE", delta: "+4", trend: "up", tone: "red", icon: "x" },
];

export const topStates = [
  { rank: 1, name: "Maharashtra", schools: 212, tier: "PLATINUM", active: 84 },
  { rank: 2, name: "Gujarat", schools: 124, tier: "GOLD", active: 77 },
  { rank: 3, name: "UP", schools: 156, tier: "BRONZE", active: 65 },
  { rank: 4, name: "Rajasthan", schools: 88, tier: "SILVER", active: 72 },
];

export const pendingMedia = [
  { school: "GDS Vadodara", state: "Gujarat", uploader: "Kiran Desai", date: "10 Jun" },
  { school: "GDS Borivali", state: "Maharashtra", uploader: "Nilesh Patil", date: "09 Jun" },
  { school: "GDS Jaipur", state: "Rajasthan", uploader: "Meera Sharma", date: "09 Jun" },
  { school: "GDS Lucknow", state: "UP", uploader: "Anil Verma", date: "08 Jun" },
];

export const rankings = [
  { tier: "Platinum", count: 82, pct: 6.6, color: "var(--platinum)" },
  { tier: "Gold", count: 214, pct: 17.1, color: "var(--gold)" },
  { tier: "Silver", count: 486, pct: 38.9, color: "var(--silver)" },
  { tier: "Bronze", count: 302, pct: 24.2, color: "var(--bronze)" },
];

export const liveActivity = [
  { id: 1, icon: "plus", tone: "blue", title: "New school added by Gujarat Regional Admin", time: "2m ago" },
  { id: 2, icon: "upload", tone: "amber", title: "GDS Vadodara uploaded new reel for review", time: "8m ago" },
  { id: 3, icon: "eye", tone: "violet", title: "Super Admin approval pending: 143 items", time: "15m ago" },
  { id: 4, icon: "file", tone: "red", title: "GDS Jaipur media rejected, notice sent", time: "1h ago" },
  { id: 5, icon: "trophy", tone: "green", title: "GDS Pune upgraded to Platinum", time: "1h ago" },
  { id: 6, icon: "plus", tone: "blue", title: "Maharashtra added 4 new schools", time: "3h ago" },
];

export const quickActions = [
  { label: "Add Regional Admin", icon: "plus", tone: "blue" },
  { label: "Approve Pending Media", icon: "check", tone: "green" },
  { label: "View India Map", icon: "map", tone: "blue" },
  { label: "Send Announcement", icon: "megaphone", tone: "amber" },
  { label: "Manage Permissions", icon: "shield", tone: "violet" },
];

// Approximate India outline coordinates (x: longitude-ish 68-97, y: latitude-ish 8-37 inverted)
export const networkNodes = [
  { name: "Mumbai", x: 72.8, y: 19.0, tier: "platinum" },
  { name: "Pune", x: 73.9, y: 18.5, tier: "platinum" },
  { name: "Nagpur", x: 79.1, y: 21.1, tier: "gold" },
  { name: "Ahmedabad", x: 72.6, y: 23.0, tier: "gold" },
  { name: "Vadodara", x: 73.2, y: 22.3, tier: "active" },
  { name: "Surat", x: 72.8, y: 21.2, tier: "active" },
  { name: "Delhi", x: 77.2, y: 28.6, tier: "platinum" },
  { name: "Gurgaon", x: 77.0, y: 28.4, tier: "gold" },
  { name: "Jaipur", x: 75.8, y: 26.9, tier: "silver" },
  { name: "Jodhpur", x: 73.0, y: 26.3, tier: "bronze" },
  { name: "Udaipur", x: 73.7, y: 24.6, tier: "silver" },
  { name: "Lucknow", x: 80.9, y: 26.8, tier: "bronze" },
  { name: "Kanpur", x: 80.3, y: 26.4, tier: "inactive" },
  { name: "Varanasi", x: 83.0, y: 25.3, tier: "silver" },
  { name: "Patna", x: 85.1, y: 25.6, tier: "bronze" },
  { name: "Kolkata", x: 88.4, y: 22.6, tier: "gold" },
  { name: "Bhubaneswar", x: 85.8, y: 20.3, tier: "silver" },
  { name: "Raipur", x: 81.6, y: 21.2, tier: "bronze" },
  { name: "Bhopal", x: 77.4, y: 23.3, tier: "silver" },
  { name: "Indore", x: 75.8, y: 22.7, tier: "gold" },
  { name: "Hyderabad", x: 78.5, y: 17.4, tier: "platinum" },
  { name: "Bengaluru", x: 77.6, y: 12.9, tier: "platinum" },
  { name: "Mysuru", x: 76.6, y: 12.3, tier: "silver" },
  { name: "Chennai", x: 80.3, y: 13.1, tier: "gold" },
  { name: "Coimbatore", x: 76.9, y: 11.0, tier: "silver" },
  { name: "Madurai", x: 78.1, y: 9.9, tier: "bronze" },
  { name: "Kochi", x: 76.3, y: 9.9, tier: "silver" },
  { name: "Thiruvananthapuram", x: 76.9, y: 8.5, tier: "active" },
  { name: "Guwahati", x: 91.7, y: 26.1, tier: "inactive" },
];

export const tierColors = {
  active: "#10b981",
  inactive: "#ef4444",
  platinum: "#8b5cf6",
  gold: "#f59e0b",
  silver: "#94a3b8",
  bronze: "#f97316",
};
