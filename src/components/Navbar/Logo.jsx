// import { useTheme } from "../../hooks/useTheme.jsx";


// export default function Logo({ className = "", maxWidth = "auto" }) {
//   const { theme } = useTheme();
//   const logo = theme === "dark" ? darkLogo : lightLogo;

//   return (
//     <img
//       src={logo}
//       alt="Global Discovery Schools"
//       className={`h-auto ${className}`}
//       style={{ maxWidth }}
//     />
//   );
// }
import { useTheme } from "../../hooks/useTheme.jsx";

export default function Logo({ className = "", maxWidth = "auto" }) {
  const { theme } = useTheme();

  const logo =
    theme === "dark"
      ? "/GDSLogoDark.jpeg"
      : "/GDSLogoLight.jpeg";

  return (
    <img
      src={logo}
      alt="Global Discovery Schools"
      className={`h-auto ${className}`}
      style={{ maxWidth }}
    />
  );
}
