import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import usePostFilters from "../usePostFilters";

const makePosts = () => [
  {
    id: "p1",
    author_id: "u1",
    title: "Alpha Post",
    content: "Alpha content here",
    created_at: "2025-01-03T00:00:00Z",
    score: 10,
    comments: [{ id: "c1" }, { id: "c2" }],
    post_author: { username: "alice" },
  },
  {
    id: "p2",
    author_id: "u2",
    title: "Beta Post",
    content: "Beta content here",
    created_at: "2025-01-01T00:00:00Z",
    score: 50,
    comments: [],
    post_author: { username: "bob" },
  },
  {
    id: "p3",
    author_id: "u1",
    title: "Gamma Post",
    content: "Gamma content here",
    created_at: "2025-01-02T00:00:00Z",
    score: 0,
    comments: [{ id: "c3" }],
    post_author: { username: "alice" },
  },
];

describe("usePostFilters", () => {
  it("defaults to newest-first sorting", () => {
    const { result } = renderHook(() =>
      usePostFilters({ posts: makePosts(), userId: "u1" })
    );
    const ids = result.current.displayedPosts.map((p) => p.id);
    // p1 is Jan 3, p3 is Jan 2, p2 is Jan 1
    expect(ids).toEqual(["p1", "p3", "p2"]);
  });

  it("sorts by oldest", () => {
    const { result } = renderHook(() =>
      usePostFilters({ posts: makePosts(), userId: "u1" })
    );
    act(() => result.current.setSortBy("oldest"));
    const ids = result.current.displayedPosts.map((p) => p.id);
    expect(ids).toEqual(["p2", "p3", "p1"]);
  });

  it("sorts by score descending", () => {
    const { result } = renderHook(() =>
      usePostFilters({ posts: makePosts(), userId: "u1" })
    );
    act(() => result.current.setSortBy("score"));
    const ids = result.current.displayedPosts.map((p) => p.id);
    expect(ids[0]).toBe("p2"); // score 50
    expect(ids[1]).toBe("p1"); // score 10
  });

  it("sorts by comments count descending", () => {
    const { result } = renderHook(() =>
      usePostFilters({ posts: makePosts(), userId: "u1" })
    );
    act(() => result.current.setSortBy("comments"));
    expect(result.current.displayedPosts[0].id).toBe("p1"); // 2 comments
  });

  it("filters by search query in title", () => {
    const { result } = renderHook(() =>
      usePostFilters({ posts: makePosts(), userId: "u1" })
    );
    act(() => result.current.setSearchQuery("Alpha"));
    expect(result.current.displayedPosts).toHaveLength(1);
    expect(result.current.displayedPosts[0].id).toBe("p1");
  });

  it("filters by search query in author username", () => {
    const { result } = renderHook(() =>
      usePostFilters({ posts: makePosts(), userId: "u1" })
    );
    act(() => result.current.setSearchQuery("bob"));
    expect(result.current.displayedPosts).toHaveLength(1);
    expect(result.current.displayedPosts[0].id).toBe("p2");
  });

  it("filters by author = mine", () => {
    const { result } = renderHook(() =>
      usePostFilters({ posts: makePosts(), userId: "u1" })
    );
    act(() => result.current.setAuthorFilter("mine"));
    const ids = result.current.displayedPosts.map((p) => p.id);
    // u1 owns p1 and p3
    expect(ids).toContain("p1");
    expect(ids).toContain("p3");
    expect(ids).not.toContain("p2");
  });

  it("filters by score >= 10", () => {
    const { result } = renderHook(() =>
      usePostFilters({ posts: makePosts(), userId: "u1" })
    );
    act(() => result.current.setScoreFilter("gte10"));
    const ids = result.current.displayedPosts.map((p) => p.id);
    expect(ids).toContain("p1"); // 10
    expect(ids).toContain("p2"); // 50
    expect(ids).not.toContain("p3"); // 0
  });

  it("filters by score >= 100 leaves no results", () => {
    const { result } = renderHook(() =>
      usePostFilters({ posts: makePosts(), userId: "u1" })
    );
    act(() => result.current.setScoreFilter("gte100"));
    expect(result.current.displayedPosts).toHaveLength(0);
  });

  it("clearControls resets all filters", () => {
    const { result } = renderHook(() =>
      usePostFilters({ posts: makePosts(), userId: "u1" })
    );

    act(() => {
      result.current.setSortBy("score");
      result.current.setSearchQuery("test");
      result.current.setAuthorFilter("mine");
      result.current.setScoreFilter("gte10");
    });

    act(() => result.current.clearControls());

    expect(result.current.sortBy).toBe("newest");
    expect(result.current.searchQuery).toBe("");
    expect(result.current.authorFilter).toBe("all");
    expect(result.current.scoreFilter).toBe("any");
  });

  it("hasActiveSearch is true when searchQuery is not empty", () => {
    const { result } = renderHook(() =>
      usePostFilters({ posts: makePosts(), userId: "u1" })
    );
    expect(result.current.hasActiveSearch).toBe(false);
    act(() => result.current.setSearchQuery("hello"));
    expect(result.current.hasActiveSearch).toBe(true);
  });

  it("hasActiveFilters is true when sortBy is not newest", () => {
    const { result } = renderHook(() =>
      usePostFilters({ posts: makePosts(), userId: "u1" })
    );
    expect(result.current.hasActiveFilters).toBe(false);
    act(() => result.current.setSortBy("oldest"));
    expect(result.current.hasActiveFilters).toBe(true);
  });
});
