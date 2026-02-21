import { describe, it, expect } from "vitest";
import { NAME_MIN, NAME_MAX } from "../constants";

describe("auth constants", () => {
  it("NAME_MIN is 4", () => {
    expect(NAME_MIN).toBe(4);
  });

  it("NAME_MAX is 32", () => {
    expect(NAME_MAX).toBe(32);
  });
});
