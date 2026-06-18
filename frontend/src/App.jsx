import AppRoutes from "./routes/AppRoutes.jsx";
import { ThemeProvider } from "./hooks/useTheme.jsx";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { Toaster } from "sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

