import SchoolAdminSchools from "../../components/SchoolAdmin/SchoolAdminSchools.jsx";
import { useTheme } from "../../hooks/useTheme.jsx";

export default function SchoolAdminSchoolsPage() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return <SchoolAdminSchools darkMode={darkMode} />;
}
