import SchoolAdminMediaApproval from "../../components/SchoolAdmin/SchoolAdminMediaApproval.jsx";
import { useTheme } from "../../hooks/useTheme.jsx";

export default function SchoolAdminMediaApprovalPage() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return <SchoolAdminMediaApproval darkMode={darkMode} />;
}
