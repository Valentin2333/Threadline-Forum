import { PASSWORD_RULES } from "./constants";

const PasswordRules = ({ password, show }) => {
  if (!show) return null;

  return (
    <ul className="fs-password-rules mt-2 mb-0 ps-0">
      {PASSWORD_RULES.map((rule) => {
        const passed = password ? rule.test(password) : false;
        return (
          <li key={rule.id} className={`fs-password-rule ${passed ? "passed" : "failed"}`}>
            <i className={`fa-solid ${passed ? "fa-check" : "fa-xmark"} fs-rule-icon`} />
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default PasswordRules;