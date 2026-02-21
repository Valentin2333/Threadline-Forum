import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthSubmitRow from "../AuthSubmitRow";

describe("AuthSubmitRow", () => {
  const defaultProps = {
    loading: false,
    submitText: "Login",
    loadingText: "Logging in...",
    secondaryText: "Don't have an account? Register",
    onSecondaryClick: vi.fn(),
  };

  it("renders submit button with submitText", () => {
    render(<AuthSubmitRow {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("renders loading state with spinner text", () => {
    render(<AuthSubmitRow {...defaultProps} loading={true} />);
    expect(screen.getByText("Logging in...")).toBeInTheDocument();
  });

  it("disables submit button while loading", () => {
    render(<AuthSubmitRow {...defaultProps} loading={true} />);
    const submitBtn = screen.getByText("Logging in...").closest("button");
    expect(submitBtn).toBeDisabled();
  });

  it("renders secondary link button", () => {
    render(<AuthSubmitRow {...defaultProps} />);
    expect(
      screen.getByText("Don't have an account? Register")
    ).toBeInTheDocument();
  });

  it("calls onSecondaryClick when secondary button is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<AuthSubmitRow {...defaultProps} onSecondaryClick={onClick} />);
    await user.click(
      screen.getByText("Don't have an account? Register")
    );
    expect(onClick).toHaveBeenCalledOnce();
  });
});
