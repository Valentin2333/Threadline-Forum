import { useMemo } from "react";

const useEmailPattern = () => {
  return useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
};

export default useEmailPattern;
