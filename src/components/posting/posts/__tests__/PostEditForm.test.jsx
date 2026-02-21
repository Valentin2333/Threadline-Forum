import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostEditForm from "../PostEditForm";

describe("PostEditForm", () => {
  const baseProps = {
    draft: { title: "My Title", content: "My Content" },
    setDraft: vi.fn(),
    fieldErrors: { title: "", content: "" },
    setFieldErrors: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  it("renders title and content fields with values", () => {
    render(<PostEditForm {...baseProps} />);
    expect(screen.getByPlaceholderText("Title")).toHaveValue("My Title");
    expect(screen.getByPlaceholderText("Content")).toHaveValue("My Content");
  });

  it("renders Save and Cancel buttons", () => {
    render(<PostEditForm {...baseProps} />);
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls onSave when Save is clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<PostEditForm {...baseProps} onSave={onSave} />);
    await user.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<PostEditForm {...baseProps} onCancel={onCancel} />);
    await user.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("displays field errors when present", () => {
    render(
      <PostEditForm
        {...baseProps}
        fieldErrors={{ title: "Min 16 chars", content: "Min 32 chars" }}
      />
    );
    expect(screen.getByText("Min 16 chars")).toBeInTheDocument();
    expect(screen.getByText("Min 32 chars")).toBeInTheDocument();
  });

  it("calls setDraft when title changes", async () => {
    const user = userEvent.setup();
    const setDraft = vi.fn();
    render(<PostEditForm {...baseProps} setDraft={setDraft} />);
    await user.type(screen.getByPlaceholderText("Title"), "x");
    expect(setDraft).toHaveBeenCalled();
  });
});
