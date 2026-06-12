import { useTheme } from "../../hooks/useTheme.jsx";
import SchoolAdminLayout from "../../components/SchoolAdmin/SchoolAdminLayout.jsx";

export default function SchoolAdmin() {
  const { theme, toggle } = useTheme();
  const darkMode = theme === "dark";

  return (
    <SchoolAdminLayout darkMode={darkMode} onToggleDark={toggle} />
  );
}
