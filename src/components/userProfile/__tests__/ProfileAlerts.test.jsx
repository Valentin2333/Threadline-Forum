import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfileAlerts from "../ProfileAlerts";

describe("ProfileAlerts", () => {
  it("renders nothing when both are empty", () => {
    const { container } = render(<ProfileAlerts success="" error="" />);
    expect(container.querySelectorAll(".alert")).toHaveLength(0);
  });

  it("renders success alert", () => {
    render(<ProfileAlerts success="Profile updated!" error="" />);
    const alert = screen.getByText("Profile updated!");
    expect(alert.closest(".alert")).toHaveClass("alert-success");
  });

  it("renders error alert", () => {
    render(<ProfileAlerts success="" error="Something broke" />);
    const alert = screen.getByText("Something broke");
    expect(alert.closest(".alert")).toHaveClass("alert-danger");
  });

  it("renders both alerts at the same time", () => {
    render(<ProfileAlerts success="Saved!" error="But also error" />);
    expect(screen.getByText("Saved!")).toBeInTheDocument();
    expect(screen.getByText("But also error")).toBeInTheDocument();
  });
});
