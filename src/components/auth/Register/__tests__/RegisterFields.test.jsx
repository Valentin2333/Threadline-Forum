import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RegisterFields from "../RegisterFields";

describe("RegisterFields", () => {
  // Create a minimal mock for react-hook-form's register function
  const mockRegister = vi.fn((name) => ({
    name,
    ref: vi.fn(),
    onChange: vi.fn(),
    onBlur: vi.fn(),
  }));

  const baseProps = {
    register: mockRegister,
    errors: {},
    rules: {
      firstName: { required: "First name is required" },
      lastName: { required: "Last name is required" },
      username: { required: "Username is required" },
      email: { required: "Email is required" },
      password: { required: "Password is required" },
    },
  };

  it("renders all five fields", () => {
    render(<RegisterFields {...baseProps} />);
    expect(screen.getByPlaceholderText("Enter first name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter last name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
  });

  it("renders all labels", () => {
    render(<RegisterFields {...baseProps} />);
    expect(screen.getByText("First name")).toBeInTheDocument();
    expect(screen.getByText("Last name")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
  });

  it("shows error message for firstName", () => {
    render(
      <RegisterFields
        {...baseProps}
        errors={{ firstName: { message: "First name is required" } }}
      />
    );
    expect(screen.getByText("First name is required")).toBeInTheDocument();
  });

  it("shows error message for email", () => {
    render(
      <RegisterFields
        {...baseProps}
        errors={{ email: { message: "Please enter a valid email" } }}
      />
    );
    expect(screen.getByText("Please enter a valid email")).toBeInTheDocument();
  });

  it("calls register for each field", () => {
    render(<RegisterFields {...baseProps} />);
    expect(mockRegister).toHaveBeenCalledWith("firstName", baseProps.rules.firstName);
    expect(mockRegister).toHaveBeenCalledWith("lastName", baseProps.rules.lastName);
    expect(mockRegister).toHaveBeenCalledWith("username", baseProps.rules.username);
    expect(mockRegister).toHaveBeenCalledWith("email", baseProps.rules.email);
    expect(mockRegister).toHaveBeenCalledWith("password", baseProps.rules.password);
  });
});
