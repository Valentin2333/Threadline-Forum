const Avatar = ({ url, size = "default" }) => {
  const sizeClass =
    size === "sm" ? "fs-avatar fs-avatar-sm" :
    size === "lg" ? "fs-avatar fs-avatar-lg" :
    "fs-avatar";

  if (!url) {
    return (
      <span className={sizeClass} aria-hidden="true">
        <i className="fa-solid fa-user" style={{ fontSize: size === "lg" ? 32 : 12, color: "var(--fs-text-muted)" }} />
      </span>
    );
  }

  return (
    <span className={sizeClass}>
      <img
        src={url}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </span>
  );
};

export default Avatar;
