import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AvatarSection from "../AvatarSection";

describe("AvatarSection", () => {
  const baseProps = {
    avatarUrl: "",
    hasAvatar: false,
    showAvatarUpload: false,
    uploadingAvatar: false,
    onAvatarSelected: vi.fn(),
    onToggleUpload: vi.fn(),
    maxAvatarMb: 5,
  };

  it("renders fallback icon when no avatar", () => {
    const { container } = render(<AvatarSection {...baseProps} />);
    expect(container.querySelector(".fa-user")).toBeInTheDocument();
  });

  it("renders image when avatarUrl is set", () => {
    render(
      <AvatarSection {...baseProps} avatarUrl="https://example.com/pic.jpg" />,
    );
    const img = screen.getByAltText("Profile avatar");
    expect(img).toHaveAttribute("src", "https://example.com/pic.jpg");
  });

  it("shows 'Upload picture' when hasAvatar is false", () => {
    render(<AvatarSection {...baseProps} />);
    expect(screen.getByText("Upload picture")).toBeInTheDocument();
  });

  it("shows 'Change picture' when hasAvatar is true", () => {
    render(<AvatarSection {...baseProps} hasAvatar={true} />);
    expect(screen.getByText("Change picture")).toBeInTheDocument();
  });

  it("calls onToggleUpload when button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleUpload = vi.fn();
    render(<AvatarSection {...baseProps} onToggleUpload={onToggleUpload} />);
    await user.click(screen.getByText("Upload picture"));
    expect(onToggleUpload).toHaveBeenCalledOnce();
  });

  it("shows file input when showAvatarUpload is true", () => {
    render(<AvatarSection {...baseProps} showAvatarUpload={true} />);
    expect(screen.getByText(/Max 5MB/)).toBeInTheDocument();
  });

  it("disables button while uploading", () => {
    render(<AvatarSection {...baseProps} uploadingAvatar={true} />);
    expect(screen.getByText("Upload picture").closest("button")).toBeDisabled();
  });
});
