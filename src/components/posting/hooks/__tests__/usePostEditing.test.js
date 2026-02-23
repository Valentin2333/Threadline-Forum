import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import usePostEditing from "../usePostEditing";
import { updatePost } from "../../../../api/posts";

describe("usePostEditing", () => {
  let onSuccess;
  let setServerError;

  beforeEach(() => {
    onSuccess = vi.fn();
    setServerError = vi.fn();
    vi.clearAllMocks();
  });

  const setup = () =>
    renderHook(() => usePostEditing({ onSuccess, setServerError }));

  it("starts with no editing state", () => {
    const { result } = setup();
    expect(result.current.editingPostId).toBeNull();
    expect(result.current.editingPostDraft).toEqual({ title: "", content: "" });
    expect(result.current.postFieldErrors).toEqual({ title: "", content: "" });
  });

  it("startEditPost sets editing state from post", () => {
    const { result } = setup();
    act(() =>
      result.current.startEditPost({
        id: "p1",
        title: "My Title",
        content: "My Content",
      }),
    );
    expect(result.current.editingPostId).toBe("p1");
    expect(result.current.editingPostDraft).toEqual({
      title: "My Title",
      content: "My Content",
    });
    expect(setServerError).toHaveBeenCalledWith("");
  });

  it("cancelEditPost clears editing state", () => {
    const { result } = setup();
    act(() =>
      result.current.startEditPost({
        id: "p1",
        title: "Title",
        content: "Content",
      }),
    );
    act(() => result.current.cancelEditPost());
    expect(result.current.editingPostId).toBeNull();
    expect(result.current.editingPostDraft).toEqual({ title: "", content: "" });
    expect(result.current.postFieldErrors).toEqual({ title: "", content: "" });
  });

  it("saveEditPost rejects empty title", async () => {
    const { result } = setup();
    act(() =>
      result.current.startEditPost({
        id: "p1",
        title: "",
        content: "x".repeat(32),
      }),
    );
    act(() =>
      result.current.setEditingPostDraft({
        title: "",
        content: "x".repeat(32),
      }),
    );
    await act(() => result.current.saveEditPost("p1"));
    expect(result.current.postFieldErrors.title).toBeTruthy();
    expect(updatePost).not.toHaveBeenCalled();
  });

  it("saveEditPost rejects short title", async () => {
    const { result } = setup();
    act(() =>
      result.current.startEditPost({
        id: "p1",
        title: "short",
        content: "x".repeat(32),
      }),
    );
    act(() =>
      result.current.setEditingPostDraft({
        title: "short",
        content: "x".repeat(32),
      }),
    );
    await act(() => result.current.saveEditPost("p1"));
    expect(result.current.postFieldErrors.title).toBeTruthy();
  });

  it("saveEditPost rejects empty content", async () => {
    const { result } = setup();
    act(() =>
      result.current.startEditPost({
        id: "p1",
        title: "x".repeat(16),
        content: "",
      }),
    );
    act(() =>
      result.current.setEditingPostDraft({
        title: "x".repeat(16),
        content: "",
      }),
    );
    await act(() => result.current.saveEditPost("p1"));
    expect(result.current.postFieldErrors.content).toBeTruthy();
    expect(updatePost).not.toHaveBeenCalled();
  });

  it("saveEditPost rejects short content", async () => {
    const { result } = setup();
    act(() =>
      result.current.startEditPost({
        id: "p1",
        title: "x".repeat(16),
        content: "short",
      }),
    );
    act(() =>
      result.current.setEditingPostDraft({
        title: "x".repeat(16),
        content: "short",
      }),
    );
    await act(() => result.current.saveEditPost("p1"));
    expect(result.current.postFieldErrors.content).toBeTruthy();
  });

  it("saveEditPost calls updatePost and onSuccess for valid input", async () => {
    updatePost.mockResolvedValueOnce({});
    const { result } = setup();
    const title = "x".repeat(16);
    const content = "y".repeat(32);
    act(() => result.current.startEditPost({ id: "p1", title, content }));
    await act(() => result.current.saveEditPost("p1"));
    expect(updatePost).toHaveBeenCalledWith({ postId: "p1", title, content });
    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.editingPostId).toBeNull();
  });

  it("saveEditPost sets server error on API failure", async () => {
    updatePost.mockRejectedValueOnce(new Error("Network error"));
    const { result } = setup();
    const title = "x".repeat(16);
    const content = "y".repeat(32);
    act(() => result.current.startEditPost({ id: "p1", title, content }));
    await act(() => result.current.saveEditPost("p1"));
    expect(setServerError).toHaveBeenCalledWith("Network error");
  });

  it("setEditingPostDraft updates draft", () => {
    const { result } = setup();
    act(() =>
      result.current.startEditPost({ id: "p1", title: "a", content: "b" }),
    );
    act(() =>
      result.current.setEditingPostDraft({
        title: "new title",
        content: "new content",
      }),
    );
    expect(result.current.editingPostDraft).toEqual({
      title: "new title",
      content: "new content",
    });
  });
});
