import { supabase } from "../../../../api/supabaseClient";

const useRegisterSubmit = ({
  clearErrors,
  setError,
  setServerError,
  setLoading,
  navigate,
}) => {
  const onSubmit = async (data) => {
    setServerError("");
    clearErrors();
    setLoading(true);

    try {
      const firstName = data.firstName.trim();
      const lastName = data.lastName.trim();
      const username = data.username.trim();
      const email = data.email.trim().toLowerCase();
      const password = data.password;

      const { data: usernameHit, error: usernameCheckError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", username)
        .limit(1);

      if (usernameCheckError) {
        setServerError(
          usernameCheckError.message || "Could not validate username.",
        );
        setLoading(false);
        return;
      }

      if (usernameHit?.length) {
        setError("username", {
          type: "server",
          message: "Username is already taken.",
        });
        setLoading(false);
        return;
      }

      const { data: emailHit, error: emailCheckError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", email)
        .limit(1);

      if (emailCheckError) {
        setServerError(emailCheckError.message || "Could not validate email.");
        setLoading(false);
        return;
      }

      if (emailHit?.length) {
        setError("email", {
          type: "server",
          message: "Email is already registered.",
        });
        setLoading(false);
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username,
          },
        },
      });

      if (signUpError) {
        const msg = (
          signUpError.message || "Registration failed."
        ).toLowerCase();

        if (msg.includes("already") && msg.includes("registered")) {
          setError("email", {
            type: "server",
            message: "Email is already registered.",
          });
        } else if (msg.includes("duplicate") || msg.includes("username")) {
          setError("username", {
            type: "server",
            message: "Username is already taken.",
          });
        } else {
          setServerError(signUpError.message || "Registration failed.");
        }

        setLoading(false);
        return;
      }

      const confirmMessage =
        "Registration successful! Please confirm your email from your inbox, then log in.";

      navigate("/login", {
        replace: true,
        state: { authMessage: confirmMessage, email },
      });
    } catch (e) {
      setServerError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return { onSubmit };
};

export default useRegisterSubmit;
