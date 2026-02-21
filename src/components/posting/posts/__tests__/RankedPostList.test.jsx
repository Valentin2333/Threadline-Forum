import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RankedPostList from "../RankedPostList";

describe("RankedPostList", () => {
  const baseMeta = (post) => <span>{post.score} pts</span>;

  it("renders the title and icon", () => {
    render(
      <RankedPostList
        title="Top Posts"
        icon="fa-solid fa-fire"
        iconColor="#f00"
        posts={[]}
        renderMeta={baseMeta}
      />
    );
    expect(screen.getByText("Top Posts")).toBeInTheDocument();
  });

  it("shows 'No posts yet.' when posts array is empty", () => {
    render(
      <RankedPostList
        title="Top"
        icon="fa-solid fa-fire"
        iconColor="#f00"
        posts={[]}
        renderMeta={baseMeta}
      />
    );
    expect(screen.getByText("No posts yet.")).toBeInTheDocument();
  });

  it("renders ranked posts with numbers", () => {
    const posts = [
      { id: "p1", title: "First Post", score: 10, created_at: "2025-01-01" },
      { id: "p2", title: "Second Post", score: 5, created_at: "2025-01-02" },
    ];

    render(
      <RankedPostList
        title="Top"
        icon="fa-solid fa-fire"
        iconColor="#f00"
        posts={posts}
        renderMeta={baseMeta}
      />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.getByText("Second Post")).toBeInTheDocument();
    expect(screen.getByText("10 pts")).toBeInTheDocument();
    expect(screen.getByText("5 pts")).toBeInTheDocument();
  });
});
