import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CommentList from "../CommentList";

describe("CommentList", () => {
  const sharedProps = {
    isOwn: vi.fn(() => false),
    canManage: vi.fn(() => false),
    editingCommentId: null,
    editingCommentDraft: "",
    setEditingCommentDraft: vi.fn(),
    commentFieldError: "",
    setCommentFieldError: vi.fn(),
    onStartEdit: vi.fn(),
    onSaveEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    onDelete: vi.fn(),
    openMenuForCommentId: null,
    onToggleMenu: vi.fn(),
    onMenuOpening: vi.fn(),
  };

  it("renders 'No comments yet' when comments is empty", () => {
    render(
      <MemoryRouter>
        <CommentList comments={[]} {...sharedProps} />
      </MemoryRouter>
    );
    expect(screen.getByText("No comments yet")).toBeInTheDocument();
  });

  it("renders comment items when comments are provided", () => {
    const comments = [
      {
        id: "c1",
        author_id: "u1",
        content: "Nice post!",
        created_at: "2025-01-01T00:00:00Z",
        comment_author: { username: "alice", avatar_url: "" },
      },
      {
        id: "c2",
        author_id: "u2",
        content: "Thanks!",
        created_at: "2025-01-02T00:00:00Z",
        comment_author: { username: "bob", avatar_url: "" },
      },
    ];

    render(
      <MemoryRouter>
        <CommentList comments={comments} {...sharedProps} />
      </MemoryRouter>
    );

    expect(screen.getByText("Nice post!")).toBeInTheDocument();
    expect(screen.getByText("Thanks!")).toBeInTheDocument();
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("bob")).toBeInTheDocument();
  });
});
