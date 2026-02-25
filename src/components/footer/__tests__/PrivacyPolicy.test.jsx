import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PrivacyPolicy from "../PrivacyPolicy";

describe("PrivacyPolicy", () => {
  const renderPP = () =>
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>,
    );

  it("renders the page title", () => {
    renderPP();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders the last updated date", () => {
    renderPP();
    const expected = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    expect(screen.getByText(`Last updated: ${expected}`)).toBeInTheDocument();
  });

  it("renders all 6 section headings", () => {
    renderPP();
    expect(screen.getByText("1. Information We Collect")).toBeInTheDocument();
    expect(screen.getByText("2. How We Use Your Information")).toBeInTheDocument();
    expect(screen.getByText("3. Data Storage & Security")).toBeInTheDocument();
    expect(screen.getByText("4. Cookies & Local Storage")).toBeInTheDocument();
    expect(screen.getByText("5. Your Rights")).toBeInTheDocument();
    expect(screen.getByText("6. Changes to This Policy")).toBeInTheDocument();
  });

  it("renders the Back button", () => {
    renderPP();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("renders the Contact us link", () => {
    renderPP();
    const link = screen.getByText("Contact us");
    expect(link.closest("a")).toHaveAttribute("href", "/contact");
  });
});
