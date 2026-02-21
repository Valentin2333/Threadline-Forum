import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Avatar from "../Avatar";

describe("Avatar", () => {
  it("renders a fallback icon when url is empty", () => {
    const { container } = render(<Avatar url="" />);
    expect(container.querySelector(".fa-user")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders a fallback icon when url is null/undefined", () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector(".fa-user")).toBeInTheDocument();
  });

  it("renders an <img> when url is provided", () => {
    const { container } = render(<Avatar url="https://example.com/pic.jpg" />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/pic.jpg");
  });

  it("uses default size class", () => {
    const { container } = render(<Avatar url="https://x.com/a.png" />);
    const span = container.querySelector(".fs-avatar");
    expect(span).toBeInTheDocument();
    expect(span).not.toHaveClass("fs-avatar-sm");
    expect(span).not.toHaveClass("fs-avatar-lg");
  });

  it("applies sm size class", () => {
    const { container } = render(
      <Avatar url="https://x.com/a.png" size="sm" />
    );
    expect(container.querySelector(".fs-avatar-sm")).toBeInTheDocument();
  });

  it("applies lg size class", () => {
    const { container } = render(
      <Avatar url="https://x.com/a.png" size="lg" />
    );
    expect(container.querySelector(".fs-avatar-lg")).toBeInTheDocument();
  });

  it("uses a larger icon for lg fallback", () => {
    const { container } = render(<Avatar url="" size="lg" />);
    const icon = container.querySelector(".fa-user");
    expect(icon.style.fontSize).toBe("32px");
  });
});
