import AppRoutes from "./routes/AppRoutes.jsx";
import { ThemeProvider } from "./hooks/useTheme.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}
