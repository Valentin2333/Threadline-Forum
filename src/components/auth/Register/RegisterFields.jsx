import Form from "react-bootstrap/Form";

const RegisterFields = ({ register, errors, rules }) => {
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>First name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter first name"
          isInvalid={!!errors.firstName}
          {...register("firstName", rules.firstName)}
        />
        <Form.Control.Feedback type="invalid">
          {errors.firstName?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Last name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter last name"
          isInvalid={!!errors.lastName}
          {...register("lastName", rules.lastName)}
        />
        <Form.Control.Feedback type="invalid">
          {errors.lastName?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter username"
          isInvalid={!!errors.username}
          autoComplete="nickname"
          {...register("username", rules.username)}
        />
        <Form.Control.Feedback type="invalid">
          {errors.username?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          isInvalid={!!errors.email}
          autoComplete="username"
          {...register("email", rules.email)}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter password"
          isInvalid={!!errors.password}
          autoComplete="new-password"
          {...register("password", rules.password)}
        />
        <Form.Control.Feedback type="invalid">
          {errors.password?.message}
        </Form.Control.Feedback>
      </Form.Group>
    </>
  );
};

export default RegisterFields;
