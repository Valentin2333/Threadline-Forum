import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FeatureList from "../FeatureList";
import { FEATURES } from "../shared/constants";

describe("FeatureList", () => {
  it("renders the header", () => {
    render(<FeatureList />);
    expect(screen.getByText("Core features")).toBeInTheDocument();
  });

  it("renders all feature titles and descriptions", () => {
    render(<FeatureList />);
    FEATURES.forEach((f) => {
      expect(screen.getByText(f.title)).toBeInTheDocument();
      expect(screen.getByText(f.desc)).toBeInTheDocument();
    });
  });

  it("renders the correct number of list group items", () => {
    const { container } = render(<FeatureList />);
    const items = container.querySelectorAll(".list-group-item");
    expect(items.length).toBe(FEATURES.length);
  });
});