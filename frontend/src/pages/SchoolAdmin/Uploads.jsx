import SchoolAdminUploads from "../../components/SchoolAdmin/SchoolAdminUploads.jsx";
import { useTheme } from "../../hooks/useTheme.jsx";

export default function SchoolAdminUploadsPage() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return <SchoolAdminUploads darkMode={darkMode} />;
}
