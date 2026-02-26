import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../Footer";

describe("Footer", () => {
  const renderFooter = () =>
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

  it("renders the Threadline brand name", () => {
    renderFooter();
    expect(screen.getByText("Threadline")).toBeInTheDocument();
  });

  it("renders the brand description", () => {
    renderFooter();
    expect(
      screen.getByText(/join communities, post ideas/i),
    ).toBeInTheDocument();
  });

  it("renders the Resources heading", () => {
    renderFooter();
    expect(screen.getByText("Resources")).toBeInTheDocument();
  });

  it("renders FAQ link pointing to /faq", () => {
    renderFooter();
    const link = screen.getByText("FAQ");
    expect(link.closest("a")).toHaveAttribute("href", "/faq");
  });

  it("renders Terms & Conditions link pointing to /terms", () => {
    renderFooter();
    const link = screen.getByText("Terms & Conditions");
    expect(link.closest("a")).toHaveAttribute("href", "/terms");
  });

  it("renders Privacy Policy link pointing to /privacy", () => {
    renderFooter();
    const link = screen.getByText("Privacy Policy");
    expect(link.closest("a")).toHaveAttribute("href", "/privacy");
  });

  it("renders the Contact Us heading", () => {
    renderFooter();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("renders the contact email link pointing to /contact", () => {
    renderFooter();
    const link = screen.getByText("Email Us");
    expect(link.closest("a")).toHaveAttribute("href", "/contact");
  });

  it("renders the copyright with current year", () => {
    renderFooter();
    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} Threadline. All rights reserved.`),
    ).toBeInTheDocument();
  });
});
