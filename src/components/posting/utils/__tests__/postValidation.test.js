import { describe, it, expect } from "vitest";
import { validatePost, mapDbErrorToFields } from "../postValidation";

/* ------------------------------------------------------------------ */
/*  validatePost                                                       */
/* ------------------------------------------------------------------ */
describe("validatePost", () => {
  const validTitle = "A".repeat(16); // exactly 16 chars
  const validContent = "B".repeat(32); // exactly 32 chars

  it("returns no errors for valid title & content", () => {
    expect(validatePost({ title: validTitle, content: validContent })).toEqual(
      {},
    );
  });

  it("requires a title", () => {
    const errs = validatePost({ title: "", content: validContent });
    expect(errs.title).toBe("Title required");
    expect(errs.content).toBeUndefined();
  });

  it("requires title >= 16 chars", () => {
    const errs = validatePost({ title: "short", content: validContent });
    expect(errs.title).toBe("Min 16 chars");
  });

  it("requires title <= 64 chars", () => {
    const errs = validatePost({
      title: "X".repeat(65),
      content: validContent,
    });
    expect(errs.title).toBe("Max 64 chars");
  });

  it("requires content", () => {
    const errs = validatePost({ title: validTitle, content: "" });
    expect(errs.content).toBe("Content required");
  });

  it("requires content >= 32 chars", () => {
    const errs = validatePost({ title: validTitle, content: "tiny" });
    expect(errs.content).toBe("Min 32 chars");
  });

  it("requires content <= 8192 chars", () => {
    const errs = validatePost({
      title: validTitle,
      content: "Y".repeat(8193),
    });
    expect(errs.content).toBe("Max 8192 chars");
  });

  it("trims whitespace before validating", () => {
    const errs = validatePost({ title: "   ", content: "   " });
    expect(errs.title).toBe("Title required");
    expect(errs.content).toBe("Content required");
  });

  it("can return errors for both fields simultaneously", () => {
    const errs = validatePost({ title: "", content: "" });
    expect(errs).toHaveProperty("title");
    expect(errs).toHaveProperty("content");
  });
});

/* ------------------------------------------------------------------ */
/*  mapDbErrorToFields                                                 */
/* ------------------------------------------------------------------ */
describe("mapDbErrorToFields", () => {
  it("maps post_title_length constraint error", () => {
    const errs = mapDbErrorToFields(
      'violates check constraint "post_title_length"',
    );
    expect(errs.title).toBe("Title must be 16-64 characters.");
  });

  it("maps post_content_length constraint error", () => {
    const errs = mapDbErrorToFields(
      'violates check constraint "post_content_length"',
    );
    expect(errs.content).toBe("Content must be 32-8192 characters.");
  });

  it("maps generic title error", () => {
    const errs = mapDbErrorToFields("title is invalid somehow");
    expect(errs.title).toBe("Invalid title.");
  });

  it("maps generic content error", () => {
    const errs = mapDbErrorToFields("content field failed");
    expect(errs.content).toBe("Invalid content.");
  });

  it("returns empty object for unrelated errors", () => {
    expect(mapDbErrorToFields("network timeout")).toEqual({});
  });

  it("handles undefined/empty input", () => {
    expect(mapDbErrorToFields()).toEqual({});
    expect(mapDbErrorToFields("")).toEqual({});
  });
});
