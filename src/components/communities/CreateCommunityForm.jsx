import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createCommunity } from "../../api/communities";

import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import InputGroup from "react-bootstrap/InputGroup";

const CreateCommunityForm = ({ show, onHide, userId }) => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: "", description: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    setServerError("");
    const name = (data.name ?? "").trim();
    const description = (data.description ?? "").trim();

    try {
      const community = await createCommunity({ userId, name, description });
      reset();
      onHide();
      navigate(`/community/${encodeURIComponent(community.name)}`);
    } catch (err) {
      const msg = err?.message || "Failed to create community.";
      if (
        msg.includes("communities_name_unique") ||
        msg.includes("duplicate")
      ) {
        setServerError("A community with this name already exists.");
      } else if (msg.toLowerCase().includes("row-level security")) {
        setServerError("You are blocked and cannot create communities.");
      } else {
        setServerError(msg);
      }
    }
  };

  const handleClose = () => {
    reset();
    setServerError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i
            className="fa-solid fa-users me-2"
            style={{ color: "var(--fs-primary)" }}
          />
          Create Community
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {serverError && (
            <Alert variant="danger" className="py-2">
              {serverError}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Community Name</Form.Label>
            <InputGroup>
              <InputGroup.Text>t/</InputGroup.Text>
              <Form.Control
                placeholder="my-community"
                {...register("name", {
                  setValueAs: (v) => {
                    let s = (typeof v === "string" ? v : "")
                      .trim()
                      .toLowerCase();
                    s = s.replace(/^t\//, ""); 
                    return `t/${s}`; 
                  },
                  required: "Name is required",
                  validate: (val) => {
                    const bare = val.replace(/^t\//, ""); 
                    if (bare.length < 2) return "Min 2 characters after t/"; 
                    if (bare.length > 62) return "Max 62 characters after t/"; 
                    if (!/^[a-z0-9][a-z0-9_-]*$/.test(bare))
                      return "Only lowercase letters, numbers, hyphens, underscores";
                    return true;
                  },
                })}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
            </InputGroup>
            <Form.Text className="text-muted">
              2-62 characters. Lowercase letters, numbers, hyphens, underscores.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Description <span className="text-muted">(optional)</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="What is this community about?"
              {...register("description", {
                maxLength: { value: 500, message: "Max 500 chars" },
              })}
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="px-4">
            {isSubmitting ? "Creating…" : "Create Community"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateCommunityForm;
