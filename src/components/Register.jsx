import { useForm } from "react-hook-form"
import Form from 'react-bootstrap/Form'

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data) => {
    console.log('form data', data)
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          {...register("email", {
            required: "Email is required"
          })}
        />
        {errors.email && <p>{errors.email.message}</p>}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Passoword must be at least 8 characters"
            }
          })}
        />
        {errors.password && <p>{errors.password.message}</p>}
      </Form.Group>

      <button type="submit">
        Register
      </button>
    </Form>
  )
}

export default Register