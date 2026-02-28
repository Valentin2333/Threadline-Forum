import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "../StatCard";

describe("StatCard", () => {
  it("renders the label", () => {
    render(<StatCard label="Users" value={42} icon="fa-solid fa-users" loading={false} />);
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  it("renders the value", () => {
    render(<StatCard label="Posts" value={99} icon="fa-solid fa-pen" loading={false} />);
    expect(screen.getByText("99")).toBeInTheDocument();
  });

  it("renders dash when value is null", () => {
    render(<StatCard label="Posts" value={null} icon="fa-solid fa-pen" loading={false} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders spinner when loading", () => {
    render(<StatCard label="Posts" value={99} icon="fa-solid fa-pen" loading={true} />);
    expect(screen.queryByText("99")).toBeNull();
    expect(document.querySelector(".spinner-border")).toBeInTheDocument();
  });

  it("renders zero correctly", () => {
    render(<StatCard label="Blocked" value={0} icon="fa-solid fa-ban" loading={false} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});