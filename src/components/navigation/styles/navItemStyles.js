export const navItemStyles = ({ isActive }) => ({
  borderRadius: 999,
  padding: "6px 14px",
  margin: "0 4px",
  fontSize: 14,
  fontWeight: 500,
  transition: "all 0.2s ease",
  background: isActive
    ? "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))"
    : "transparent",
  border: isActive
    ? "1px solid rgba(255,255,255,0.25)"
    : "1px solid transparent",
  backdropFilter: isActive ? "blur(6px)" : "none",
  color: isActive ? "#fff" : "rgba(255,255,255,0.85)",
  boxShadow: isActive ? "0 0 0 1px rgba(255,255,255,0.1)" : "none",
});

export const navItemStylesWithAvatar = ({ isActive }) => ({
  ...navItemStyles({ isActive }),
  display: "inline-flex",
  alignItems: "center",
});
