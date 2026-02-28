import { describe, it, expect } from "vitest";
import { TITLE_MIN, TITLE_MAX, CONTENT_MIN, CONTENT_MAX } from "../constants";

describe("posting constants", () => {
  it("title limits are valid", () => {
    expect(TITLE_MIN).toBeGreaterThan(0);
    expect(TITLE_MAX).toBeGreaterThan(TITLE_MIN);
  });

  it("content limits are valid", () => {
    expect(CONTENT_MIN).toBeGreaterThan(0);
    expect(CONTENT_MAX).toBeGreaterThan(CONTENT_MIN);
  });

  it("title max matches DB constraint (64)", () => {
    expect(TITLE_MAX).toBe(64);
  });

  it("content max matches DB constraint (8192)", () => {
    expect(CONTENT_MAX).toBe(8192);
  });
});