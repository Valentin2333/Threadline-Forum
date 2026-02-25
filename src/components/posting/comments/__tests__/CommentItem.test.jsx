import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CommentItem from "../CommentItem";

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("CommentItem", () => {
  const comment = {
    id: "c1",
    author_id: "u1",
    content: "This is a comment",
    created_at: "2025-01-15T12:00:00Z",
    score: 5,
    comment_author: { username: "alice", avatar_url: null },
  };

  const baseProps = {
    comment,
    isOwn: () => false,
    canManage: () => false,
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

  it("renders comment content", () => {
    renderWithRouter(<CommentItem {...baseProps} />);
    expect(screen.getByText("This is a comment")).toBeInTheDocument();
  });

  it("renders author username as link", () => {
    renderWithRouter(<CommentItem {...baseProps} />);
    const link = screen.getByText("alice");
    expect(link.closest("a")).toHaveAttribute("href", "/profile/u1");
  });

  it("renders timestamp", () => {
    renderWithRouter(<CommentItem {...baseProps} />);
    expect(
      screen.getByText(new Date("2025-01-15T12:00:00Z").toLocaleString()),
    ).toBeInTheDocument();
  });

  it("does not show menu when canManage returns false", () => {
    renderWithRouter(<CommentItem {...baseProps} />);
    expect(screen.queryByRole("button", { name: "" })).toBeNull();
  });

  it("shows menu toggle when canManage returns true", () => {
    renderWithRouter(<CommentItem {...baseProps} canManage={() => true} />);
    // The 3-dots toggle button should exist
    const toggles = screen.getAllByRole("button");
    expect(toggles.length).toBeGreaterThan(0);
  });

  it("shows edit textarea when editingCommentId matches", () => {
    renderWithRouter(
      <CommentItem
        {...baseProps}
        isOwn={() => true}
        canManage={() => true}
        editingCommentId="c1"
        editingCommentDraft="Editing this"
      />,
    );
    expect(screen.getByPlaceholderText("Edit comment")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Editing this")).toBeInTheDocument();
  });

  it("shows Save and Cancel buttons when editing", () => {
    renderWithRouter(
      <CommentItem
        {...baseProps}
        canManage={() => true}
        editingCommentId="c1"
        editingCommentDraft="Editing"
      />,
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls onSaveEdit when Save is clicked", async () => {
    const user = userEvent.setup();
    const onSaveEdit = vi.fn();
    renderWithRouter(
      <CommentItem
        {...baseProps}
        canManage={() => true}
        editingCommentId="c1"
        editingCommentDraft="Updated"
        onSaveEdit={onSaveEdit}
      />,
    );
    await user.click(screen.getByText("Save"));
    expect(onSaveEdit).toHaveBeenCalledWith("c1");
  });

  it("calls onCancelEdit when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancelEdit = vi.fn();
    renderWithRouter(
      <CommentItem
        {...baseProps}
        canManage={() => true}
        editingCommentId="c1"
        editingCommentDraft="text"
        onCancelEdit={onCancelEdit}
      />,
    );
    await user.click(screen.getByText("Cancel"));
    expect(onCancelEdit).toHaveBeenCalledOnce();
  });

  it("shows field error when commentFieldError is set", () => {
    renderWithRouter(
      <CommentItem
        {...baseProps}
        canManage={() => true}
        editingCommentId="c1"
        editingCommentDraft=""
        commentFieldError="Content required"
      />,
    );
    expect(screen.getByText("Content required")).toBeInTheDocument();
  });

  it("renders 'Unknown user' when username is missing", () => {
    renderWithRouter(
      <CommentItem
        {...baseProps}
        comment={{ ...comment, comment_author: { username: null } }}
      />,
    );
    expect(screen.getByText("Unknown user")).toBeInTheDocument();
  });
});
