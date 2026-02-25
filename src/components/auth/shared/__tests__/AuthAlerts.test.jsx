import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthAlerts from "../AuthAlerts";

describe("AuthAlerts", () => {
  it("renders nothing when both props are empty", () => {
    const { container } = render(<AuthAlerts infoMessage="" serverError="" />);
    expect(container.querySelectorAll(".alert")).toHaveLength(0);
  });

  it("renders a success alert when infoMessage is set", () => {
    render(<AuthAlerts infoMessage="Check your email!" serverError="" />);
    const alert = screen.getByText("Check your email!");
    expect(alert.closest(".alert")).toHaveClass("alert-success");
  });

  it("renders a danger alert when serverError is set", () => {
    render(<AuthAlerts infoMessage="" serverError="Invalid credentials" />);
    const alert = screen.getByText("Invalid credentials");
    expect(alert.closest(".alert")).toHaveClass("alert-danger");
  });

  it("renders both alerts simultaneously", () => {
    render(
      <AuthAlerts infoMessage="Info message" serverError="Error message" />,
    );
    expect(screen.getByText("Info message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });
});
