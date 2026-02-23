import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const NAME_MIN = 4;
const NAME_MAX = 32;

const EditProfileForm = ({
  register,
  handleSubmit,
  onSave,
  errors,
  isDirty,
  isValid,
  saving,
  getValues,
  reset,
  isAdmin,
}) => {
  return (
    <Form onSubmit={handleSubmit(onSave)}>
      <Form.Group className="mb-3">
        <Form.Label>First name</Form.Label>
        <Form.Control
          type="text"
          placeholder="First name"
          isInvalid={Boolean(errors.firstName)}
          {...register("firstName", {
            required: "First name is required.",
            validate: (v) => {
              const trimmed = (v ?? "").trim();
              if (trimmed.length < NAME_MIN) {
                return `First name must be at least ${NAME_MIN} characters.`;
              }
              if (trimmed.length > NAME_MAX) {
                return `First name must be at most ${NAME_MAX} characters.`;
              }
              return true;
            },
          })}
          onBlur={(e) => {
            const next = e.target.value.trim();
            if (next !== e.target.value) {
              const current = getValues();
              reset(
                { ...current, firstName: next },
                { keepDirty: true, keepErrors: true },
              );
            }
          }}
        />
        <Form.Control.Feedback type="invalid">
          {errors.firstName?.message}
        </Form.Control.Feedback>
        <Form.Text muted>
          Must be {NAME_MIN}–{NAME_MAX} characters.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Last name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Last name"
          isInvalid={Boolean(errors.lastName)}
          {...register("lastName", {
            required: "Last name is required.",
            validate: (v) => {
              const trimmed = (v ?? "").trim();
              if (trimmed.length < NAME_MIN) {
                return `Last name must be at least ${NAME_MIN} characters.`;
              }
              if (trimmed.length > NAME_MAX) {
                return `Last name must be at most ${NAME_MAX} characters.`;
              }
              return true;
            },
          })}
          onBlur={(e) => {
            const next = e.target.value.trim();
            if (next !== e.target.value) {
              const current = getValues();
              reset(
                { ...current, lastName: next },
                { keepDirty: true, keepErrors: true },
              );
            }
          }}
        />
        <Form.Control.Feedback type="invalid">
          {errors.lastName?.message}
        </Form.Control.Feedback>
        <Form.Text muted>
          Must be {NAME_MIN}–{NAME_MAX} characters.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Username"
          disabled
          {...register("username")}
        />
        <Form.Text muted>
          <i className="fa-solid fa-lock me-1" style={{ fontSize: 10 }} />
          Username cannot be changed.
        </Form.Text>
      </Form.Group>

      {isAdmin && (
        <Form.Group className="mb-3">
          <Form.Label>Phone number</Form.Label>
          <Form.Control
            type="tel"
            placeholder="e.g. +359 123 456 789"
            isInvalid={Boolean(errors.phone)}
            {...register("phone", {
              validate: (v) => {
                const trimmed = (v ?? "").trim();
                if (!trimmed) return true;
                if (!/^\+?[\d\s\-().]{7,20}$/.test(trimmed)) {
                  return "Please enter a valid phone number.";
                }
                return true;
              },
            })}
          />
          <Form.Control.Feedback type="invalid">
            {errors.phone?.message}
          </Form.Control.Feedback>
          <Form.Text muted>Optional.</Form.Text>
        </Form.Group>
      )}

      <Button
        type="submit"
        disabled={saving || !isDirty || !isValid}
        className="px-4"
      >
        {saving ? (
          <>
            <Spinner size="sm" className="me-2" />
            Saving...
          </>
        ) : (
          <>
            <i className="fa-solid fa-check me-2" style={{ fontSize: 12 }} />
            Save changes
          </>
        )}
      </Button>
    </Form>
  );
};

export default EditProfileForm;
