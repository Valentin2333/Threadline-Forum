import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostSearchBar from "../PostSearchBar";

describe("PostSearchBar", () => {
  it("renders search input when showSearch is true", () => {
    render(
      <PostSearchBar
        showSearch={true}
        searchQuery=""
        setSearchQuery={vi.fn()}
      />
    );
    expect(
      screen.getByPlaceholderText("Search title, content, author…")
    ).toBeInTheDocument();
  });

  it("renders Clear button that is disabled when searchQuery is empty", () => {
    render(
      <PostSearchBar
        showSearch={true}
        searchQuery=""
        setSearchQuery={vi.fn()}
      />
    );
    expect(screen.getByText("Clear").closest("button")).toBeDisabled();
  });

  it("Clear button is enabled when searchQuery is non-empty", () => {
    render(
      <PostSearchBar
        showSearch={true}
        searchQuery="hello"
        setSearchQuery={vi.fn()}
      />
    );
    expect(screen.getByText("Clear").closest("button")).not.toBeDisabled();
  });

  it("calls setSearchQuery when typing", async () => {
    const user = userEvent.setup();
    const setSearchQuery = vi.fn();
    render(
      <PostSearchBar
        showSearch={true}
        searchQuery=""
        setSearchQuery={setSearchQuery}
      />
    );
    await user.type(
      screen.getByPlaceholderText("Search title, content, author…"),
      "test"
    );
    expect(setSearchQuery).toHaveBeenCalled();
  });

  it("calls setSearchQuery with empty string when Clear is clicked", async () => {
    const user = userEvent.setup();
    const setSearchQuery = vi.fn();
    render(
      <PostSearchBar
        showSearch={true}
        searchQuery="something"
        setSearchQuery={setSearchQuery}
      />
    );
    await user.click(screen.getByText("Clear"));
    expect(setSearchQuery).toHaveBeenCalledWith("");
  });
});
