import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditActions from "../EditActions";

describe("EditActions", () => {
  it("shows 'Edit profile' button when not editing", () => {
    render(
      <EditActions
        isEditing={false}
        saving={false}
        onStartEdit={vi.fn()}
        onCancelEdit={vi.fn()}
      />
    );
    expect(screen.getByText("Edit profile")).toBeInTheDocument();
  });

  it("shows 'Cancel' button when editing", () => {
    render(
      <EditActions
        isEditing={true}
        saving={false}
        onStartEdit={vi.fn()}
        onCancelEdit={vi.fn()}
      />
    );
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.queryByText("Edit profile")).toBeNull();
  });

  it("calls onStartEdit when Edit profile is clicked", async () => {
    const user = userEvent.setup();
    const onStartEdit = vi.fn();
    render(
      <EditActions
        isEditing={false}
        saving={false}
        onStartEdit={onStartEdit}
        onCancelEdit={vi.fn()}
      />
    );
    await user.click(screen.getByText("Edit profile"));
    expect(onStartEdit).toHaveBeenCalledOnce();
  });

  it("calls onCancelEdit when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancelEdit = vi.fn();
    render(
      <EditActions
        isEditing={true}
        saving={false}
        onStartEdit={vi.fn()}
        onCancelEdit={onCancelEdit}
      />
    );
    await user.click(screen.getByText("Cancel"));
    expect(onCancelEdit).toHaveBeenCalledOnce();
  });

  it("disables Cancel when saving", () => {
    render(
      <EditActions
        isEditing={true}
        saving={true}
        onStartEdit={vi.fn()}
        onCancelEdit={vi.fn()}
      />
    );
    expect(screen.getByText("Cancel").closest("button")).toBeDisabled();
  });
});
