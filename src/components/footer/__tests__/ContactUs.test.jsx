import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ContactUs from "../ContactUs";

describe("ContactUs", () => {
  const renderContact = () =>
    render(
      <MemoryRouter>
        <ContactUs />
      </MemoryRouter>,
    );

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the page title", () => {
    renderContact();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("renders the Back button", () => {
    renderContact();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("renders Name, Email, Subject, and Message fields", () => {
    renderContact();
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("What is this about?"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write your message here..."),
    ).toBeInTheDocument();
  });

  it("renders Send Message and Clear buttons", () => {
    renderContact();
    expect(screen.getByText("Send Message")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    renderContact();
    fireEvent.click(screen.getByText("Send Message"));
    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Subject is required")).toBeInTheDocument();
      expect(screen.getByText("Message is required")).toBeInTheDocument();
    });
  });

  it("shows success message after successful submission", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });

    renderContact();

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("What is this about?"), {
      target: { value: "Test subject" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Write your message here..."),
      {
        target: { value: "This is a test message for Threadline." },
      },
    );

    fireEvent.click(screen.getByText("Send Message"));

    await waitFor(() => {
      expect(screen.getByText("Message sent!")).toBeInTheDocument();
    });
  });

  it("shows error message when submission fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });

    renderContact();

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("What is this about?"), {
      target: { value: "Test subject" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Write your message here..."),
      {
        target: { value: "This is a test message for Threadline." },
      },
    );

    fireEvent.click(screen.getByText("Send Message"));

    await waitFor(() => {
      expect(screen.getByText("Failed to send message.")).toBeInTheDocument();
    });
  });

  it("shows Send another message button after success", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });

    renderContact();

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("What is this about?"), {
      target: { value: "Test subject" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Write your message here..."),
      {
        target: { value: "This is a test message for Threadline." },
      },
    );

    fireEvent.click(screen.getByText("Send Message"));

    await waitFor(() => {
      expect(screen.getByText("Send another message")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Send another message"));
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
  });
});
