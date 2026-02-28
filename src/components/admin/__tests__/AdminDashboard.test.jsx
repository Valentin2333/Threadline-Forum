import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "../AdminDashboard";

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const getTab = (key) =>
  document.querySelector(`a.nav-link[data-rr-ui-event-key="${key}"]`);

describe("AdminDashboard", () => {
  it("renders the page title", () => {
    renderWithRouter(<AdminDashboard />);
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("renders all four tab links", () => {
    renderWithRouter(<AdminDashboard />);
    expect(getTab("users")).toBeInTheDocument();
    expect(getTab("communities")).toBeInTheDocument();
    expect(getTab("posts")).toBeInTheDocument();
    expect(getTab("reports")).toBeInTheDocument();
  });

  it("defaults to the Reports tab", () => {
    renderWithRouter(<AdminDashboard />);
    expect(getTab("reports")).toHaveClass("active");
  });

  it("switches to Users tab when clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminDashboard />);
    await user.click(getTab("users"));
    expect(getTab("users")).toHaveClass("active");
  });

  it("switches to Communities tab when clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminDashboard />);
    await user.click(getTab("communities"));
    expect(getTab("communities")).toHaveClass("active");
  });

  it("switches to Posts tab when clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminDashboard />);
    await user.click(getTab("posts"));
    expect(getTab("posts")).toHaveClass("active");
  });
});