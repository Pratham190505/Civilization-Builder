import SchoolAdminSettings from "../../components/SchoolAdmin/SchoolAdminSettings.jsx";
import { useTheme } from "../../hooks/useTheme.jsx";

export default function SchoolAdminSettingsPage() {
  const { theme, toggle } = useTheme();
  const darkMode = theme === "dark";

  return <SchoolAdminSettings darkMode={darkMode} onToggleDark={toggle} />;
}
