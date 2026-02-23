import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useDeleteModal from "../useDeleteModal";
import { deletePost } from "../../../../api/posts";
import { deleteComment } from "../../../../api/comments";

describe("useDeleteModal", () => {
  let onSuccess;
  let onPostDeleted;
  let setServerError;
  let cancelEditPost;
  let cancelEditComment;

  beforeEach(() => {
    onSuccess = vi.fn();
    onPostDeleted = vi.fn();
    setServerError = vi.fn();
    cancelEditPost = vi.fn();
    cancelEditComment = vi.fn();
    vi.clearAllMocks();
  });

  const setup = (overrides = {}) =>
    renderHook(() =>
      useDeleteModal({
        onSuccess,
        onPostDeleted,
        setServerError,
        cancelEditPost,
        cancelEditComment,
        editingPostId: null,
        editingCommentId: null,
        ...overrides,
      }),
    );

  it("starts with modal closed", () => {
    const { result } = setup();
    expect(result.current.deleteModal).toEqual({
      show: false,
      type: null,
      id: null,
    });
    expect(result.current.deleting).toBe(false);
  });

  it("openDeletePostModal opens modal with post type", () => {
    const { result } = setup();
    act(() => result.current.openDeletePostModal("p1"));
    expect(result.current.deleteModal).toEqual({
      show: true,
      type: "post",
      id: "p1",
    });
    expect(setServerError).toHaveBeenCalledWith("");
  });

  it("openDeleteCommentModal opens modal with comment type", () => {
    const { result } = setup();
    act(() => result.current.openDeleteCommentModal("c1"));
    expect(result.current.deleteModal).toEqual({
      show: true,
      type: "comment",
      id: "c1",
    });
  });

  it("closeDeleteModal resets modal state", () => {
    const { result } = setup();
    act(() => result.current.openDeletePostModal("p1"));
    act(() => result.current.closeDeleteModal());
    expect(result.current.deleteModal).toEqual({
      show: false,
      type: null,
      id: null,
    });
  });

  it("executeDelete calls deletePost for post type", async () => {
    deletePost.mockResolvedValueOnce(true);
    const { result } = setup();
    act(() => result.current.openDeletePostModal("p1"));
    await act(() => result.current.executeDelete());
    expect(deletePost).toHaveBeenCalledWith({ postId: "p1" });
    expect(onPostDeleted).toHaveBeenCalled();
  });

  it("executeDelete calls deleteComment for comment type", async () => {
    deleteComment.mockResolvedValueOnce(true);
    const { result } = setup();
    act(() => result.current.openDeleteCommentModal("c1"));
    await act(() => result.current.executeDelete());
    expect(deleteComment).toHaveBeenCalledWith({ commentId: "c1" });
    expect(onSuccess).toHaveBeenCalled();
  });

  it("executeDelete cancels post editing if deleting the post being edited", async () => {
    deletePost.mockResolvedValueOnce(true);
    const { result } = setup({ editingPostId: "p1" });
    act(() => result.current.openDeletePostModal("p1"));
    await act(() => result.current.executeDelete());
    expect(cancelEditPost).toHaveBeenCalled();
  });

  it("executeDelete does not cancel post editing if deleting a different post", async () => {
    deletePost.mockResolvedValueOnce(true);
    const { result } = setup({ editingPostId: "p2" });
    act(() => result.current.openDeletePostModal("p1"));
    await act(() => result.current.executeDelete());
    expect(cancelEditPost).not.toHaveBeenCalled();
  });

  it("executeDelete cancels comment editing if deleting the comment being edited", async () => {
    deleteComment.mockResolvedValueOnce(true);
    const { result } = setup({ editingCommentId: "c1" });
    act(() => result.current.openDeleteCommentModal("c1"));
    await act(() => result.current.executeDelete());
    expect(cancelEditComment).toHaveBeenCalled();
  });

  it("executeDelete sets server error on failure", async () => {
    deletePost.mockRejectedValueOnce(new Error("Forbidden"));
    const { result } = setup();
    act(() => result.current.openDeletePostModal("p1"));
    await act(() => result.current.executeDelete());
    expect(setServerError).toHaveBeenCalledWith("Forbidden");
    expect(result.current.deleteModal.show).toBe(false);
  });

  it("executeDelete closes modal after success", async () => {
    deleteComment.mockResolvedValueOnce(true);
    const { result } = setup();
    act(() => result.current.openDeleteCommentModal("c1"));
    await act(() => result.current.executeDelete());
    expect(result.current.deleteModal.show).toBe(false);
  });
});
