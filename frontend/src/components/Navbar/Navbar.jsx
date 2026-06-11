import { HiOutlineMagnifyingGlass, HiOutlineBell, HiOutlineBars3, HiChevronDown } from "react-icons/hi2";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar({ onOpenMobile }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Mobile hamburger */}
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-foreground hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <HiOutlineBars3 className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
            Super Admin Overview
          </h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            Monitor all schools, approvals, rankings and regional activity
          </p>
        </div>

        {/* Search */}
        <div className="relative hidden flex-1 max-w-md md:block">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search schools, states, admins…"
            className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="relative rounded-lg border border-border bg-surface p-2 text-foreground hover:bg-muted"
            aria-label="Notifications"
          >
            <HiOutlineBell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-danger" />
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-surface py-1.5 pl-1.5 pr-3 hover:bg-muted">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-[11px] font-semibold text-white">
              AA
            </span>
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              Anurag Admin
            </span>
            <HiChevronDown className="hidden h-4 w-4 text-muted-foreground sm:inline" />
          </button>
        </div>
      </div>
    </header>
  );
}
