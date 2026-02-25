import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TermsAndConditions from "../TermsAndConditions";

describe("TermsAndConditions", () => {
  const renderTC = () =>
    render(
      <MemoryRouter>
        <TermsAndConditions />
      </MemoryRouter>,
    );

  it("renders the page title", () => {
    renderTC();
    expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
  });

  it("renders the last updated date", () => {
    renderTC();
    const expected = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    expect(screen.getByText(`Last updated: ${expected}`)).toBeInTheDocument();
  });

  it("renders all 6 section headings", () => {
    renderTC();
    expect(screen.getByText("1. Acceptance of Terms")).toBeInTheDocument();
    expect(screen.getByText("2. User Accounts")).toBeInTheDocument();
    expect(screen.getByText("3. User Content")).toBeInTheDocument();
    expect(screen.getByText("4. Community Guidelines")).toBeInTheDocument();
    expect(screen.getByText("5. Limitation of Liability")).toBeInTheDocument();
    expect(screen.getByText("6. Changes to Terms")).toBeInTheDocument();
  });

  it("renders the Back button", () => {
    renderTC();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("renders the Contact us link", () => {
    renderTC();
    const link = screen.getByText("Contact us");
    expect(link.closest("a")).toHaveAttribute("href", "/contact");
  });
});
