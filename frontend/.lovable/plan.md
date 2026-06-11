
# Plan — GDS Admin Portal (Dashboard only, Phase 1)

You asked for plain **Vite + React (JS) + React Router DOM + Tailwind + React Icons**, so I'll replace the current TanStack Start scaffold with that stack. Only the **Dashboard** page will be implemented now; the other 9 routes will render simple "Coming soon" placeholders inside the same `MainLayout` so navigation works, and I'll fill them in when you give the next prompt.

## Stack & setup

- Strip TanStack Start (`src/routes/`, `src/router.tsx`, `src/start.ts`, `src/server.ts`, `routeTree.gen.ts`, server-fn folders, TanStack vite plugins).
- Vite + React 19 (JS, `.jsx`) with `react-router-dom` v6 (`BrowserRouter`, `Routes`, `Route`, `NavLink`).
- Tailwind v4 already wired via `src/styles.css` — keep it, add CSS variables for both themes.
- Add deps: `react-router-dom`, `react-icons`, `recharts`. Replace `index.html` entry to mount `main.jsx` → `<App />`.

## Folder structure

```text
src/
  main.jsx
  App.jsx
  styles.css
  routes/
    AppRoutes.jsx
  layouts/
    MainLayout.jsx
  components/
    Sidebar/Sidebar.jsx
    Sidebar/SidebarLink.jsx
    Navbar/Navbar.jsx
    Navbar/ThemeToggle.jsx
    Cards/StatCard.jsx
    Cards/QuickActionButton.jsx
    Cards/ActivityItem.jsx
    Cards/TopStateRow.jsx
    Tables/PendingMediaTable.jsx
    Tables/RankingsList.jsx
    Charts/SchoolNetworkChart.jsx   (recharts scatter)
    Charts/RankingsBarChart.jsx     (recharts bar, used later)
  pages/
    Dashboard/Dashboard.jsx
    States/States.jsx               (placeholder)
    Schools/Schools.jsx             (placeholder)
    MediaApprovals/MediaApprovals.jsx
    Rankings/Rankings.jsx
    UsersRoles/UsersRoles.jsx
    Notifications/Notifications.jsx
    Settings/Settings.jsx
    ActivityLogs/ActivityLogs.jsx
    Reports/Reports.jsx
  data/
    mockData.js                     (schools, states, activity, rankings)
  hooks/
    useTheme.js                     (persisted light/dark)
  assets/
```

## Theming

CSS variables on `:root` (light) and `.dark` (dark) in `styles.css`, mapped through `@theme inline` so Tailwind utilities like `bg-surface`, `bg-sidebar`, `text-foreground`, `border-border`, `text-muted` resolve in both modes. Sidebar always uses `#090D1A` family; content surface swaps white ⇄ near-black. Sun/moon toggle in navbar, persisted to `localStorage`, applied by toggling `.dark` on `<html>`.

Key tokens:
- `--sidebar: #090D1A`, `--sidebar-foreground: #E6E8EF`
- `--primary: #2563EB`
- Light: `--background: #F6F5F2` (matches the soft off-white in screenshot), `--surface: #FFFFFF`, `--foreground: #0F172A`
- Dark: `--background: #0B0F1C`, `--surface: #121829`, `--foreground: #F1F5F9`
- Accent stat-card tints: blue, green, amber, violet, red (soft bg + solid icon).

## Layout (MainLayout)

- Grid: fixed left sidebar (260px) + main column. Right "rail" (Live Activity / Quick Actions / Admin Control) is **part of the Dashboard page**, not the layout, since other pages won't share it.
- Responsive: sidebar fixed on `lg+`, collapsible drawer (overlay + slide-in) on `md` and below, hamburger in navbar.
- Sticky navbar at top of main column.

### Sidebar contents (exact order from Figma)

Brand block "GDS Control Hub / SUPER ADMIN" with bolt logo.
Sections:
- OVERVIEW: Dashboard, India Map
- MANAGEMENT: States, Regional Admins, Schools
- OPERATIONS: Media Approval (badge 143), Rankings, Analytics
- COMMUNICATION: Notifications (badge 12), Messages
- SYSTEM: Permissions, Audit Logs, Settings

Footer: avatar "Anurag Admin / Super Admin" + logout icon.

Active item: blue-tinted pill background, blue left text. Hover: subtle white/5 background. Icons from `react-icons` (hi2 / lucide via react-icons/lu).

**Routing note**: requested URLs (`/states`, `/schools`, `/media-approvals`, `/rankings`, `/users-roles`, `/notifications`, `/settings`, `/activity-logs`, `/reports`) map to sidebar items. India Map, Regional Admins, Analytics, Messages, Permissions, Audit Logs from the Figma don't appear in your route list — I'll point them to the closest existing route (e.g. Audit Logs → `/activity-logs`, Analytics → `/reports`, Permissions → `/users-roles`) and add `/india-map`, `/regional-admins`, `/messages` as extra placeholder routes so every sidebar link works.

### Navbar

Left: page title ("Super Admin Overview") + subtitle ("Monitor all schools, approvals, rankings and regional activity"). Center: search input with `⌘K` chip. Right: theme toggle, notification bell with red dot, user pill ("AA · Anurag Admin" with chevron).

## Dashboard page composition

Matches Figma top→bottom:

1. **5 stat cards** in a responsive grid (5 cols `xl`, 3 cols `md`, 1 col mobile):
   - Total Schools 1,248 (+12, blue, building icon)
   - Active Schools 986 (+2.4%, green, check icon)
   - Pending 143 (−8, amber, clock icon)
   - Approved Media 8,420 (+18%, violet, film icon)
   - Rejected 326 (+4, red, x-circle icon)
   Each: soft tinted icon tile, label, big number, sub-label, delta chip (green/red arrow).

2. **Two-column row**:
   - Left (2fr): "India School Network" card — header with title + "Search state…" input + "All India" select. Body: Recharts `ScatterChart` rendering ~29 dots positioned in rough India-shape coordinates, colored by tier (active/inactive/platinum/gold/silver/bronze). Footer: 6-dot legend exactly as Figma.
   - Right (1fr): "Top States" card — 4 ranked rows (Maharashtra Platinum 84%, Gujarat Gold 77%, UP Bronze 65%, Rajasthan Silver 72%) with rank badge, name, school count, tier label, progress bar, "% active" right-aligned.

3. **Second two-column row**:
   - Left (2fr): "Pending Media Approval" card with "143 pending" chip, table (School, State, Uploaded By, Date, Status, Action). Rows for GDS Vadodara, GDS Borivali, plus 2 more realistic rows. Status = amber "PENDING" badge. Actions = green "Approve", red "Reject", eye view icon.
   - Right (1fr): "Rankings" card — "1,248 TOTAL SCHOOLS" subtitle, 4 tier rows (Platinum 82 / 6.6%, Gold 214 / 17.1%, Silver 486 / 38.9%, Bronze 302 / 24.2%) with colored progress bars.

4. **Right rail** (only on `xl+`, hidden below):
   - "LIVE ACTIVITY" card with green pulse dot + 5 activity items (icon, title, "Xm ago").
   - "QUICK ACTIONS" card — 5 buttons (Add Regional Admin, Approve Pending Media, View India Map, Send Announcement, Manage Permissions) each with leading icon.
   - "ADMIN CONTROL" card stub (matches the cut-off card at bottom right of Figma).

All copy and numbers come from a `mockData.js` module so I'm not duplicating literals across components.

## Responsive behavior

- `< md` (mobile): sidebar becomes drawer, navbar collapses search into icon, stat cards stack 1-col, right rail moves below main content as stacked cards.
- `md`–`lg` (tablet): sidebar drawer, stat cards 2–3 cols, right-rail below.
- `xl+`: full 3-region layout as Figma.

## Out of scope for this phase

- Modals, forms, real CRUD, auth.
- Other 9 pages get a shared `<Placeholder title="States" />` style component until you greenlight them.

After you approve, I'll do the rip-and-replace and build the Dashboard.
