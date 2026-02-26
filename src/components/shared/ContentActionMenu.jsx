import Dropdown from "react-bootstrap/Dropdown";

const ContentActionMenu = ({
  show,
  onToggle,
  showEdit,
  showDelete,
  showReport,
  onEdit,
  onDelete,
  onReport,
}) => {
  return (
    <Dropdown align="end" show={show} onToggle={onToggle}>
      <Dropdown.Toggle
        variant="outline-secondary"
        size="sm"
        bsPrefix="btn"
        className="fs-menu-toggle"
      >
        <i
          className="fa-solid fa-ellipsis-vertical"
          style={{ fontSize: 13 }}
        />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {showEdit && (
          <Dropdown.Item onClick={onEdit}>
            <i className="fa-solid fa-pen me-2" style={{ fontSize: 12 }} />
            Edit
          </Dropdown.Item>
        )}
        {showDelete && (
          <Dropdown.Item className="text-danger" onClick={onDelete}>
            <i className="fa-solid fa-trash me-2" style={{ fontSize: 12 }} />
            Delete
          </Dropdown.Item>
        )}
        {showReport && (
          <Dropdown.Item onClick={onReport}>
            <i
              className="fa-solid fa-flag me-2"
              style={{ fontSize: 12, color: "var(--bs-danger)" }}
            />
            Report
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ContentActionMenu;