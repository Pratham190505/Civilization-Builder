export default function SchoolAdminLogo({
  darkMode,
  maxWidth = "200px",
  maxHeight = "80px",
  className = "",
}) {
  const logoPath = darkMode ? "/GDSLogoDark.jpeg" : "/GDSLogoLight.jpeg";

  return (
    <img
      src={logoPath}
      alt="Global Discovery Schools"
      className={className}
      style={{
        maxWidth,
        maxHeight,
        height: "auto",
        width: "auto",
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}
