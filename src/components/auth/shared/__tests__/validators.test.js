import { describe, it, expect } from "vitest";
import { minTrimmedLength } from "../validators";

describe("minTrimmedLength", () => {
  it("returns true when trimmed value meets the minimum", () => {
    const validate = minTrimmedLength(4, "Username");
    expect(validate("abcd")).toBe(true);
    expect(validate("  abcd  ")).toBe(true); // trimmed is 4
  });

  it("returns an error string when too short after trimming", () => {
    const validate = minTrimmedLength(4, "Username");
    expect(validate("ab")).toBe("Username must be at least 4 characters");
    expect(validate("   a   ")).toBe("Username must be at least 4 characters");
  });

  it("returns an error for empty string", () => {
    const validate = minTrimmedLength(4, "Name");
    expect(validate("")).toBe("Name must be at least 4 characters");
  });

  it("returns an error for whitespace-only string", () => {
    const validate = minTrimmedLength(1, "Field");
    expect(validate("    ")).toBe("Field must be at least 1 characters");
  });

  it("uses the correct label in error messages", () => {
    const validate = minTrimmedLength(3, "First name");
    const result = validate("ab");
    expect(result).toContain("First name");
    expect(result).toContain("3");
  });
});
