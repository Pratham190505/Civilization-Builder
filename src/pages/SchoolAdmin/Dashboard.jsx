import SchoolAdminDashboard from "../../components/SchoolAdmin/SchoolAdminDashboard.jsx";
import { useTheme } from "../../hooks/useTheme.jsx";

export default function SchoolAdminDashboardPage() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return <SchoolAdminDashboard darkMode={darkMode} />;
}
