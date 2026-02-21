import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteAccountSection from "../DeleteAccountSection";

describe("DeleteAccountSection", () => {
  it("renders Danger zone heading", () => {
    render(<DeleteAccountSection onOpen={vi.fn()} />);
    expect(screen.getByText("Danger zone")).toBeInTheDocument();
  });

  it("renders delete button", () => {
    render(<DeleteAccountSection onOpen={vi.fn()} />);
    expect(screen.getByText("Delete my account")).toBeInTheDocument();
  });

  it("calls onOpen when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<DeleteAccountSection onOpen={onOpen} />);
    await user.click(screen.getByText("Delete my account"));
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
