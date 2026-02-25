import useTheme from "./ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`fs-theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="fs-theme-toggle-track">
        <span className={`fs-theme-toggle-thumb ${isDark ? "dark" : ""}`}>
          <i
            className={isDark ? "fa-solid fa-moon" : "fa-solid fa-sun"}
            style={{ fontSize: 10 }}
          />
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
