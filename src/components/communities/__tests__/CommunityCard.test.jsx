import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CommunityCard from "../CommunityCard";

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("CommunityCard", () => {
  const community = {
    id: "c1",
    name: "React Devs",
    description: "A community for React developers",
    member_count: 42,
  };

  it("renders community name as a link", () => {
    renderWithRouter(<CommunityCard community={community} />);
    const link = screen.getByText("React Devs");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/community/React%20Devs",
    );
  });

  it("renders description", () => {
    renderWithRouter(<CommunityCard community={community} />);
    expect(
      screen.getByText("A community for React developers"),
    ).toBeInTheDocument();
  });

  it("renders member count", () => {
    renderWithRouter(<CommunityCard community={community} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("truncates long descriptions at 120 characters", () => {
    const longDesc = "A".repeat(130);
    renderWithRouter(
      <CommunityCard community={{ ...community, description: longDesc }} />,
    );
    expect(screen.getByText("A".repeat(120) + "…")).toBeInTheDocument();
  });

  it("renders without description", () => {
    renderWithRouter(
      <CommunityCard community={{ ...community, description: null }} />,
    );
    expect(screen.getByText("React Devs")).toBeInTheDocument();
  });

  it("shows 0 when member_count is missing", () => {
    renderWithRouter(
      <CommunityCard community={{ ...community, member_count: undefined }} />,
    );
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
