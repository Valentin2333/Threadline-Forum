import { describe, it, expect } from "vitest";
import { FAQ_ITEMS, PRIVACY_SECTIONS, TERMS_SECTIONS } from "../constants";

describe("footer constants", () => {
  it("FAQ_ITEMS is non-empty with question and answer", () => {
    expect(FAQ_ITEMS.length).toBeGreaterThan(0);
    FAQ_ITEMS.forEach((item) => {
      expect(typeof item.question).toBe("string");
      expect(item.question.length).toBeGreaterThan(0);
      expect(typeof item.answer).toBe("string");
      expect(item.answer.length).toBeGreaterThan(0);
    });
  });

  it("PRIVACY_SECTIONS is non-empty with title and content", () => {
    expect(PRIVACY_SECTIONS.length).toBeGreaterThan(0);
    PRIVACY_SECTIONS.forEach((s) => {
      expect(typeof s.title).toBe("string");
      expect(typeof s.content).toBe("string");
    });
  });

  it("TERMS_SECTIONS is non-empty with title and content", () => {
    expect(TERMS_SECTIONS.length).toBeGreaterThan(0);
    TERMS_SECTIONS.forEach((s) => {
      expect(typeof s.title).toBe("string");
      expect(typeof s.content).toBe("string");
    });
  });
});