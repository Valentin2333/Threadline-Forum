import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfileSummary from "../ProfileSummary";

describe("ProfileSummary", () => {
  const profile = {
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
    phone: "+1234567890",
    reputation: 42,
  };

  it("displays email, name, and username", () => {
    render(
      <ProfileSummary
        userEmail="john@example.com"
        profile={profile}
        isAdmin={false}
      />,
    );
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("johndoe")).toBeInTheDocument();
  });

  it("displays reputation", () => {
    render(
      <ProfileSummary
        userEmail="john@example.com"
        profile={profile}
        isAdmin={false}
      />,
    );
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows phone only when isAdmin is true", () => {
    const { rerender } = render(
      <ProfileSummary userEmail="a@b.com" profile={profile} isAdmin={false} />,
    );
    expect(screen.queryByText("+1234567890")).toBeNull();

    rerender(
      <ProfileSummary userEmail="a@b.com" profile={profile} isAdmin={true} />,
    );
    expect(screen.getByText("+1234567890")).toBeInTheDocument();
  });

  it("shows dash when username is empty", () => {
    render(
      <ProfileSummary
        userEmail="a@b.com"
        profile={{ ...profile, username: "" }}
        isAdmin={false}
      />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
