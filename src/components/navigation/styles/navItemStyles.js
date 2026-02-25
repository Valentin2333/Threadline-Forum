export const navItemStyles = ({ isActive }) => ({
  borderRadius: "0.5rem",
  padding: "6px 14px",
  margin: "0 4px",
  fontSize: 14,
  fontWeight: 500,
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  background: isActive ? "rgba(129, 140, 248, 0.15)" : "transparent",
  border: isActive
    ? "1px solid rgba(129, 140, 248, 0.25)"
    : "1px solid transparent",
  color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
  boxShadow: isActive ? "0 0 0 1px rgba(129, 140, 248, 0.1)" : "none",
});

export const navItemStylesWithAvatar = ({ isActive }) => ({
  ...navItemStyles({ isActive }),
  display: "inline-flex",
  alignItems: "center",
});
