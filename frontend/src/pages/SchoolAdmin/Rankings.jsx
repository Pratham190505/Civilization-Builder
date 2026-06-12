import SchoolAdminRankings from "../../components/SchoolAdmin/SchoolAdminRankings.jsx";
import { useTheme } from "../../hooks/useTheme.jsx";

export default function SchoolAdminRankingsPage() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return <SchoolAdminRankings darkMode={darkMode} />;
}
