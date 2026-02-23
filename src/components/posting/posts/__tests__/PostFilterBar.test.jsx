import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostFilterBar from "../PostFilterBar";

describe("PostFilterBar", () => {
  const baseProps = {
    showFilters: true,
    sortBy: "newest",
    setSortBy: vi.fn(),
    authorFilter: "all",
    setAuthorFilter: vi.fn(),
    scoreFilter: "any",
    setScoreFilter: vi.fn(),
    userId: "u1",
    onClear: vi.fn(),
    onRefresh: vi.fn(),
  };

  const getSelect = (label) => {
    const labelEl = screen.getByText(label);
    return labelEl.closest(".form-group, div")?.querySelector("select");
  };

  it("renders sort, author, and score dropdowns when visible", () => {
    render(<PostFilterBar {...baseProps} />);
    expect(getSelect("Sort")).toBeInTheDocument();
    expect(getSelect("Author")).toBeInTheDocument();
    expect(getSelect("Score")).toBeInTheDocument();
  });

  it("renders Reset and Refresh buttons", () => {
    render(<PostFilterBar {...baseProps} />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  it("calls onClear when Reset is clicked", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<PostFilterBar {...baseProps} onClear={onClear} />);
    await user.click(screen.getByText("Reset"));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("calls onRefresh when Refresh is clicked", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(<PostFilterBar {...baseProps} onRefresh={onRefresh} />);
    await user.click(screen.getByText("Refresh"));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("calls setSortBy when sort dropdown changes", async () => {
    const user = userEvent.setup();
    const setSortBy = vi.fn();
    render(<PostFilterBar {...baseProps} setSortBy={setSortBy} />);
    await user.selectOptions(getSelect("Sort"), "score");
    expect(setSortBy).toHaveBeenCalledWith("score");
  });

  it("calls setAuthorFilter when author dropdown changes", async () => {
    const user = userEvent.setup();
    const setAuthorFilter = vi.fn();
    render(<PostFilterBar {...baseProps} setAuthorFilter={setAuthorFilter} />);
    await user.selectOptions(getSelect("Author"), "mine");
    expect(setAuthorFilter).toHaveBeenCalledWith("mine");
  });

  it("calls setScoreFilter when score dropdown changes", async () => {
    const user = userEvent.setup();
    const setScoreFilter = vi.fn();
    render(<PostFilterBar {...baseProps} setScoreFilter={setScoreFilter} />);
    await user.selectOptions(getSelect("Score"), "gte10");
    expect(setScoreFilter).toHaveBeenCalledWith("gte10");
  });

  it("disables author dropdown when userId is null", () => {
    render(<PostFilterBar {...baseProps} userId={null} />);
    expect(getSelect("Author")).toBeDisabled();
  });
});
