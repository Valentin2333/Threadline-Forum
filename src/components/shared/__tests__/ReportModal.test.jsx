import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportModal from "../ReportModal";
import { createReport } from "../../../api/reports";

vi.mock("../../../api/reports");

describe("ReportModal", () => {
  const baseProps = {
    show: true,
    onHide: vi.fn(),
    postId: "post-1",
    commentId: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when show is false", () => {
    const { container } = render(
      <ReportModal {...baseProps} show={false} />
    );
    expect(container.querySelector(".modal")).toBeNull();
  });

  it("renders title with 'post' when postId is provided", () => {
    render(<ReportModal {...baseProps} />);
    expect(screen.getByText("Report post")).toBeInTheDocument();
  });

  it("renders title with 'comment' when commentId is provided", () => {
    render(
      <ReportModal
        {...baseProps}
        postId={undefined}
        commentId="comment-1"
      />
    );
    expect(screen.getByText("Report comment")).toBeInTheDocument();
  });

  it("renders all three reason options", () => {
    render(<ReportModal {...baseProps} />);
    expect(screen.getByText("Harassment")).toBeInTheDocument();
    expect(screen.getByText("Violence")).toBeInTheDocument();
    expect(screen.getByText("Hate")).toBeInTheDocument();
  });

  it("submit button is disabled when no reason selected", () => {
    render(<ReportModal {...baseProps} />);
    expect(screen.getByText("Submit Report").closest("button")).toBeDisabled();
  });

  it("submit button is enabled after selecting a reason", async () => {
    const user = userEvent.setup();
    render(<ReportModal {...baseProps} />);
    await user.click(screen.getByLabelText(/Harassment/));
    expect(
      screen.getByText("Submit Report").closest("button")
    ).not.toBeDisabled();
  });

  it("calls createReport with correct args on submit", async () => {
    const user = userEvent.setup();
    createReport.mockResolvedValueOnce();
    render(<ReportModal {...baseProps} />);
    await user.click(screen.getByLabelText(/Violence/));
    await user.click(screen.getByText("Submit Report"));
    expect(createReport).toHaveBeenCalledWith({
      postId: "post-1",
      commentId: undefined,
      reason: "violence",
    });
  });

  it("shows success message after submit", async () => {
    const user = userEvent.setup();
    createReport.mockResolvedValueOnce();
    render(<ReportModal {...baseProps} />);
    await user.click(screen.getByLabelText(/Hate/));
    await user.click(screen.getByText("Submit Report"));
    expect(
      await screen.findByText("Report submitted. Thank you.")
    ).toBeInTheDocument();
  });

  it("shows error message when createReport fails", async () => {
    const user = userEvent.setup();
    createReport.mockRejectedValueOnce(new Error("Server error"));
    render(<ReportModal {...baseProps} />);
    await user.click(screen.getByLabelText(/Harassment/));
    await user.click(screen.getByText("Submit Report"));
    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });

  it("calls onHide when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onHide = vi.fn();
    render(<ReportModal {...baseProps} onHide={onHide} />);
    await user.click(screen.getByText("Cancel"));
    expect(onHide).toHaveBeenCalledOnce();
  });

  it("only allows one reason to be selected at a time", async () => {
    const user = userEvent.setup();
    render(<ReportModal {...baseProps} />);
    const harassment = screen.getByLabelText(/Harassment/);
    const violence = screen.getByLabelText(/Violence/);

    await user.click(harassment);
    expect(harassment).toBeChecked();

    await user.click(violence);
    expect(violence).toBeChecked();
    expect(harassment).not.toBeChecked();
  });
});