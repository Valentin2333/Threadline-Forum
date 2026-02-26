import { describe, it, expect } from "vitest";
import { FEATURES } from "../constants";

describe("home constants", () => {
  it("FEATURES is a non-empty array", () => {
    expect(Array.isArray(FEATURES)).toBe(true);
    expect(FEATURES.length).toBeGreaterThan(0);
  });

  it("each feature has required fields", () => {
    FEATURES.forEach((f) => {
      expect(typeof f.title).toBe("string");
      expect(f.title.length).toBeGreaterThan(0);
      expect(typeof f.desc).toBe("string");
      expect(f.desc.length).toBeGreaterThan(0);
      expect(typeof f.badge).toBe("string");
      expect(typeof f.icon).toBe("string");
    });
  });
});