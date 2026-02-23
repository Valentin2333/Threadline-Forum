import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useCommentEditing from "../useCommentEditing";
import { updateComment } from "../../../../api/comments";

describe("useCommentEditing", () => {
  let onSuccess;
  let setServerError;

  beforeEach(() => {
    onSuccess = vi.fn();
    setServerError = vi.fn();
    vi.clearAllMocks();
  });

  const setup = () =>
    renderHook(() => useCommentEditing({ onSuccess, setServerError }));

  it("starts with no editing state", () => {
    const { result } = setup();
    expect(result.current.editingCommentId).toBeNull();
    expect(result.current.editingCommentDraft).toBe("");
    expect(result.current.commentFieldError).toBe("");
  });

  it("startEditComment sets editing state", () => {
    const { result } = setup();
    act(() =>
      result.current.startEditComment({ id: "c1", content: "Hello world" }),
    );
    expect(result.current.editingCommentId).toBe("c1");
    expect(result.current.editingCommentDraft).toBe("Hello world");
    expect(setServerError).toHaveBeenCalledWith("");
  });

  it("cancelEditComment clears editing state", () => {
    const { result } = setup();
    act(() => result.current.startEditComment({ id: "c1", content: "Hello" }));
    act(() => result.current.cancelEditComment());
    expect(result.current.editingCommentId).toBeNull();
    expect(result.current.editingCommentDraft).toBe("");
    expect(result.current.commentFieldError).toBe("");
  });

  it("saveEditComment rejects empty content", async () => {
    const { result } = setup();
    act(() =>
      result.current.startEditComment({ id: "c1", content: "original" }),
    );
    act(() => result.current.setEditingCommentDraft(""));
    await act(() => result.current.saveEditComment("c1"));
    expect(result.current.commentFieldError).toBe("Content required");
    expect(updateComment).not.toHaveBeenCalled();
  });

  it("saveEditComment rejects whitespace-only content", async () => {
    const { result } = setup();
    act(() =>
      result.current.startEditComment({ id: "c1", content: "original" }),
    );
    act(() => result.current.setEditingCommentDraft("   "));
    await act(() => result.current.saveEditComment("c1"));
    expect(result.current.commentFieldError).toBe("Content required");
  });

  it("saveEditComment calls updateComment and onSuccess for valid input", async () => {
    updateComment.mockResolvedValueOnce({});
    const { result } = setup();
    act(() =>
      result.current.startEditComment({ id: "c1", content: "original" }),
    );
    act(() => result.current.setEditingCommentDraft("Updated content"));
    await act(() => result.current.saveEditComment("c1"));
    expect(updateComment).toHaveBeenCalledWith({
      commentId: "c1",
      content: "Updated content",
    });
    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.editingCommentId).toBeNull();
  });

  it("saveEditComment sets server error on API failure", async () => {
    updateComment.mockRejectedValueOnce(new Error("DB error"));
    const { result } = setup();
    act(() =>
      result.current.startEditComment({ id: "c1", content: "original" }),
    );
    act(() => result.current.setEditingCommentDraft("Valid content"));
    await act(() => result.current.saveEditComment("c1"));
    expect(setServerError).toHaveBeenCalledWith("DB error");
  });

  it("setEditingCommentDraft updates draft", () => {
    const { result } = setup();
    act(() => result.current.startEditComment({ id: "c1", content: "old" }));
    act(() => result.current.setEditingCommentDraft("new draft"));
    expect(result.current.editingCommentDraft).toBe("new draft");
  });
});
