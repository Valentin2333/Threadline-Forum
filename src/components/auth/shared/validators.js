import { PASSWORD_RULES } from "./constants";

export const minTrimmedLength = (min, label) => {
  return (v) =>
    v.trim().length >= min || `${label} must be at least ${min} characters`;
};

export const validatePassword = (value) => {
  const failing = PASSWORD_RULES.filter((r) => !r.test(value));
  if (failing.length === 0) return true;
  return "Password does not meet all requirements";
};