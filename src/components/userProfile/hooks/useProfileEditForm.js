import { useForm } from "react-hook-form";

const useProfileEditForm = () => {
  return useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
  });
};

export default useProfileEditForm;
