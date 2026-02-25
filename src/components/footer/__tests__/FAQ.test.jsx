import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FAQ from "../FAQ";

describe("FAQ", () => {
  const renderFAQ = () =>
    render(
      <MemoryRouter>
        <FAQ />
      </MemoryRouter>,
    );

  it("renders the page title", () => {
    renderFAQ();
    expect(
      screen.getByText("Frequently Asked Questions"),
    ).toBeInTheDocument();
  });

  it("renders all 5 FAQ questions", () => {
    renderFAQ();
    expect(screen.getByText("How do I create a community?")).toBeInTheDocument();
    expect(screen.getByText("How does the voting system work?")).toBeInTheDocument();
    expect(screen.getByText("Can I edit or delete my posts and comments?")).toBeInTheDocument();
    expect(screen.getByText("How do I change my profile picture?")).toBeInTheDocument();
    expect(screen.getByText("What happens if I leave or get removed from a community?")).toBeInTheDocument();
  });

  it("shows answer when a question is clicked", () => {
    renderFAQ();
    fireEvent.click(screen.getByText("How do I create a community?"));
    expect(screen.getByText(/prefixed with f\//i)).toBeInTheDocument();
  });

  it("renders the Back button", () => {
    renderFAQ();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("renders the Contact us link", () => {
    renderFAQ();
    const link = screen.getByText("Contact us");
    expect(link.closest("a")).toHaveAttribute("href", "/contact");
  });
});
