import { useForm } from "react-hook-form";
import useEmailPattern from "../../shared/hooks/useEmailPattern";
import { NAME_MAX, NAME_MIN } from "../../shared/constants";
import { minTrimmedLength } from "../../shared/validators";

const useRegisterForm = () => {
  const emailPattern = useEmailPattern();

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const rules = {
    firstName: {
      required: "First name is required",
      minLength: {
        value: NAME_MIN,
        message: `First name must be at least ${NAME_MIN} characters`,
      },
      maxLength: {
        value: NAME_MAX,
        message: `First name must be at most ${NAME_MAX} characters`,
      },
      validate: minTrimmedLength(NAME_MIN, "First name"),
    },
    lastName: {
      required: "Last name is required",
      minLength: {
        value: NAME_MIN,
        message: `Last name must be at least ${NAME_MIN} characters`,
      },
      maxLength: {
        value: NAME_MAX,
        message: `Last name must be at most ${NAME_MAX} characters`,
      },
      validate: minTrimmedLength(NAME_MIN, "Last name"),
    },
    username: {
      required: "Username is required",
      minLength: {
        value: NAME_MIN,
        message: `Username must be at least ${NAME_MIN} characters`,
      },
      maxLength: {
        value: NAME_MAX,
        message: `Username must be at most ${NAME_MAX} characters`,
      },
      validate: minTrimmedLength(NAME_MIN, "Username"),
    },
    email: {
      required: "Email is required",
      pattern: {
        value: emailPattern,
        message: "Please enter a valid email",
      },
    },
    password: {
      required: "Password is required",
      minLength: {
        value: 8,
        message: "Password must be at least 8 characters",
      },
    },
  };

  return { form, rules };
};

export default useRegisterForm;
