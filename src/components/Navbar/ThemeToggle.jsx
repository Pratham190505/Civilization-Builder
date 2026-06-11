import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import { useTheme } from "../../hooks/useTheme.jsx";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      className="rounded-lg border border-border bg-surface p-2 text-foreground hover:bg-muted"
      aria-label="Toggle theme"
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      {isDark ? <HiOutlineSun className="h-4 w-4" /> : <HiOutlineMoon className="h-4 w-4" />}
    </button>
  );
}
