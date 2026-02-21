import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import useEmailPattern from "../useEmailPattern";

describe("useEmailPattern", () => {
  it("returns a RegExp", () => {
    const { result } = renderHook(() => useEmailPattern());
    expect(result.current).toBeInstanceOf(RegExp);
  });

  it("matches valid emails", () => {
    const { result } = renderHook(() => useEmailPattern());
    const pattern = result.current;

    expect(pattern.test("user@example.com")).toBe(true);
    expect(pattern.test("john.doe@company.org")).toBe(true);
    expect(pattern.test("a@b.co")).toBe(true);
  });

  it("rejects invalid emails", () => {
    const { result } = renderHook(() => useEmailPattern());
    const pattern = result.current;

    expect(pattern.test("")).toBe(false);
    expect(pattern.test("noatsign")).toBe(false);
    expect(pattern.test("@nodomain")).toBe(false);
    expect(pattern.test("user@")).toBe(false);
    expect(pattern.test("user @example.com")).toBe(false); // space
  });

  it("returns the same reference on re-render (memoized)", () => {
    const { result, rerender } = renderHook(() => useEmailPattern());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
