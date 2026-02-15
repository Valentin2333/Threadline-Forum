const Avatar = ({ url }) => {
  if (!url) {
    return (
      <span
        aria-hidden="true"
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.15)",
          marginRight: 8,
          fontSize: 14,
        }}
      >
        👤
      </span>
    );
  }

  return (
    <img
      src={url}
      alt=""
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        objectFit: "cover",
        marginRight: 8,
      }}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
};

export default Avatar;
