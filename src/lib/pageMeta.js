export const pageMeta = {
  "/": { title: "Super Admin Overview", subtitle: "Monitor all schools, approvals, rankings and regional activity" },
  "/india-map": { title: "India School Network Map", subtitle: "State-wise school activity across 29 states — click to explore" },
  "/states": { title: "State Management", subtitle: "Manage all states, regional admins and school counts" },
  "/regional-admins": { title: "Regional Admin Management", subtitle: "Manage regional admin accounts and state assignments" },
  "/schools": { title: "School Management", subtitle: "View and manage all GDS schools across India" },
  "/media-approvals": { title: "Media Approval Center", subtitle: "Review and approve school-uploaded media reels" },
  "/rankings": { title: "School Ranking System", subtitle: "Assign and manage school performance rankings" },
  "/reports": { title: "National Analytics", subtitle: "National performance charts and school activity trends" },
  "/notifications": { title: "Notification Center", subtitle: "System notifications and action alerts" },
  "/messages": { title: "Messages", subtitle: "Inbox and broadcast messages to admins and schools" },
  "/users-roles": { title: "Role & Permission Control", subtitle: "Manage role-based access control for all admin levels" },
  "/activity-logs": { title: "Audit Logs", subtitle: "Track every administrative action across the platform" },
  "/settings": { title: "Settings", subtitle: "Configure platform preferences and account details" },
};

export function getPageMeta(pathname) {
  return pageMeta[pathname] || { title: "GDS Control Hub", subtitle: "" };
}
