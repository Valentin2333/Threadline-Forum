import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileShell from "../ProfileShell";

describe("ProfileShell", () => {
  it("shows spinner when loadingUser is true", () => {
    const { container } = render(
      <ProfileShell loadingUser={true} user={null} authError="" onGoLogin={vi.fn()}>
        <p>Content</p>
      </ProfileShell>
    );
    expect(container.querySelector(".spinner-border")).toBeInTheDocument();
    expect(screen.getByText("Loading user...")).toBeInTheDocument();
  });

  it("shows auth error when present", () => {
    render(
      <ProfileShell loadingUser={false} user={null} authError="Auth failed" onGoLogin={vi.fn()}>
        <p>Content</p>
      </ProfileShell>
    );
    expect(screen.getByText("Auth failed")).toBeInTheDocument();
  });

  it("shows login prompt when user is null", () => {
    render(
      <ProfileShell loadingUser={false} user={null} authError="" onGoLogin={vi.fn()}>
        <p>Content</p>
      </ProfileShell>
    );
    expect(
      screen.getByText("You must be logged in to view your profile.")
    ).toBeInTheDocument();
  });

  it("calls onGoLogin when Go to Login is clicked", async () => {
    const user = userEvent.setup();
    const onGoLogin = vi.fn();
    render(
      <ProfileShell loadingUser={false} user={null} authError="" onGoLogin={onGoLogin}>
        <p>Content</p>
      </ProfileShell>
    );
    await user.click(screen.getByText("Go to Login"));
    expect(onGoLogin).toHaveBeenCalledOnce();
  });

  it("renders children when user is present", () => {
    render(
      <ProfileShell
        loadingUser={false}
        user={{ id: "u1" }}
        authError=""
        onGoLogin={vi.fn()}
      >
        <p>Profile page content</p>
      </ProfileShell>
    );
    expect(screen.getByText("Profile page content")).toBeInTheDocument();
  });
});
