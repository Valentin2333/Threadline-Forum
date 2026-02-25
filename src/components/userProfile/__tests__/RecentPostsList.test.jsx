import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RecentPostsList from "../RecentPostsList";

describe("RecentPostsList", () => {
  it("renders the section heading", () => {
    render(
      <MemoryRouter>
        <RecentPostsList posts={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Recent posts")).toBeInTheDocument();
  });

  it("shows empty message when no posts", () => {
    render(
      <MemoryRouter>
        <RecentPostsList posts={[]} />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("This user hasn't posted yet."),
    ).toBeInTheDocument();
  });

  it("renders post titles as links", () => {
    const posts = [
      {
        id: "p1",
        title: "Hello World",
        created_at: "2025-01-01",
        score: 5,
        comment_count: 2,
      },
      {
        id: "p2",
        title: "Another Post",
        created_at: "2025-01-02",
        score: 0,
        comment_count: 0,
      },
    ];

    render(
      <MemoryRouter>
        <RecentPostsList posts={posts} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText("Another Post")).toBeInTheDocument();

    const link = screen.getByText("Hello World").closest("a");
    expect(link).toHaveAttribute("href", "/posts/p1");
  });
});
