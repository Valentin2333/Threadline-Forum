import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfileCard from "../ProfileCard";

describe("ProfileCard", () => {
  it("shows spinner while loading", () => {
    const { container } = render(
      <ProfileCard loadingProfile={true} profile={null}>
        <p>Children</p>
      </ProfileCard>
    );
    expect(container.querySelector(".spinner-border")).toBeInTheDocument();
    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  it("shows warning when profile is null after loading", () => {
    render(
      <ProfileCard loadingProfile={false} profile={null}>
        <p>Children</p>
      </ProfileCard>
    );
    expect(
      screen.getByText("No profile row found for this user.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Children")).toBeNull();
  });

  it("renders children when profile is present", () => {
    render(
      <ProfileCard loadingProfile={false} profile={{ id: "1" }}>
        <p>Profile content</p>
      </ProfileCard>
    );
    expect(screen.getByText("Profile content")).toBeInTheDocument();
  });
});
