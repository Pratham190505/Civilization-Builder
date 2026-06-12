import SchoolAdminDistricts from "../../components/SchoolAdmin/SchoolAdminDistricts.jsx";
import { useTheme } from "../../hooks/useTheme.jsx";

export default function SchoolAdminDistrictsPage() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return <SchoolAdminDistricts darkMode={darkMode} />;
}
