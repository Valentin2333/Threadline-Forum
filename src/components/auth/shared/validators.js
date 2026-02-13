export const minTrimmedLength = (min, label) => {
  return (v) =>
    v.trim().length >= min || `${label} must be at least ${min} characters`;
};
