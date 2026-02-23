import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteConfirmModal from "../DeleteConfirmModal";

describe("DeleteConfirmModal", () => {
  const baseProps = {
    show: true,
    onHide: vi.fn(),
    onDelete: vi.fn(),
    deleting: false,
    title: "Delete post",
    warning: "Are you sure?",
  };

  it("renders title and warning when shown", () => {
    render(<DeleteConfirmModal {...baseProps} />);
    expect(screen.getByText("Delete post")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("renders Yes and No buttons", () => {
    render(<DeleteConfirmModal {...baseProps} />);
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("calls onDelete when Yes is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<DeleteConfirmModal {...baseProps} onDelete={onDelete} />);
    await user.click(screen.getByText("Yes"));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("calls onHide when No is clicked", async () => {
    const user = userEvent.setup();
    const onHide = vi.fn();
    render(<DeleteConfirmModal {...baseProps} onHide={onHide} />);
    await user.click(screen.getByText("No"));
    expect(onHide).toHaveBeenCalledOnce();
  });

  it("disables buttons while deleting", () => {
    render(<DeleteConfirmModal {...baseProps} deleting={true} />);
    expect(screen.getByText("Deleting…").closest("button")).toBeDisabled();
    expect(screen.getByText("No").closest("button")).toBeDisabled();
  });

  it("shows spinner while deleting", () => {
    render(<DeleteConfirmModal {...baseProps} deleting={true} />);
    expect(screen.getByText("Deleting…")).toBeInTheDocument();
  });

  it("renders nothing when show is false", () => {
    const { container } = render(
      <DeleteConfirmModal {...baseProps} show={false} />,
    );
    expect(container.querySelector(".modal")).toBeNull();
  });
});
