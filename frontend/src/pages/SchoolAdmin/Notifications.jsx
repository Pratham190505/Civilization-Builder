import SchoolAdminNotifications from "../../components/SchoolAdmin/SchoolAdminNotifications.jsx";
import { useTheme } from "../../hooks/useTheme.jsx";

export default function SchoolAdminNotificationsPage() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return <SchoolAdminNotifications darkMode={darkMode} />;
}
