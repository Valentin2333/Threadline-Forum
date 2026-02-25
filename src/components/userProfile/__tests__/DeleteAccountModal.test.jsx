import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteAccountModal from "../DeleteAccountModal";

describe("DeleteAccountModal", () => {
  const baseProps = {
    show: true,
    onHide: vi.fn(),
    deleting: false,
    confirmText: "",
    onChangeConfirmText: vi.fn(),
    onDelete: vi.fn(),
  };

  it("renders the modal title", () => {
    render(<DeleteAccountModal {...baseProps} />);
    expect(screen.getByText("Delete account")).toBeInTheDocument();
  });

  it("renders permanent warning", () => {
    render(<DeleteAccountModal {...baseProps} />);
    expect(
      screen.getByText(
        "This is permanent. Your profile will be deleted forever.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the confirm text input", () => {
    render(<DeleteAccountModal {...baseProps} />);
    expect(screen.getByPlaceholderText("delete")).toBeInTheDocument();
  });

  it("calls onChangeConfirmText when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DeleteAccountModal {...baseProps} onChangeConfirmText={onChange} />,
    );
    await user.type(screen.getByPlaceholderText("delete"), "d");
    expect(onChange).toHaveBeenCalled();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<DeleteAccountModal {...baseProps} onDelete={onDelete} />);
    await user.click(screen.getByText("Delete permanently"));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("disables buttons while deleting", () => {
    render(<DeleteAccountModal {...baseProps} deleting={true} />);
    expect(screen.getByText("Deleting...").closest("button")).toBeDisabled();
    expect(screen.getByText("Cancel").closest("button")).toBeDisabled();
  });
});
