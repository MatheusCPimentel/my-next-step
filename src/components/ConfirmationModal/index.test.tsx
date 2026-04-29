import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmationModal } from "@/components/ConfirmationModal";

const defaultProps = {
  title: "Delete column?",
  description: "This action cannot be undone.",
  primaryButtonText: "Delete",
  secondaryButtonText: "Cancel",
  onConfirm: () => {},
  onCancel: () => {},
};

const renderModal = (overrides: Partial<React.ComponentProps<typeof ConfirmationModal>> = {}) =>
  render(<ConfirmationModal {...defaultProps} {...overrides} />);

describe("ConfirmationModal", () => {
  it("renders the title and description", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /delete column\?/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This action cannot be undone."),
    ).toBeInTheDocument();
  });

  it("renders the icon when provided and omits it when not", () => {
    const { rerender } = renderModal({
      icon: <svg data-testid="modal-icon" aria-label="lock-icon" />,
    });

    expect(screen.getByTestId("modal-icon")).toBeInTheDocument();

    rerender(<ConfirmationModal {...defaultProps} />);

    expect(screen.queryByTestId("modal-icon")).not.toBeInTheDocument();
  });

  it("renders buttons in row layout by default with secondary before primary", () => {
    renderModal();

    const buttons = screen.getAllByRole("button");

    expect(buttons[0]).toHaveAccessibleName("Cancel");
    expect(buttons[1]).toHaveAccessibleName("Delete");
  });

  it("renders buttons in column layout with primary before secondary when areButtonsColumn is true", () => {
    renderModal({ areButtonsColumn: true });

    const buttons = screen.getAllByRole("button");

    expect(buttons[0]).toHaveAccessibleName("Delete");
    expect(buttons[1]).toHaveAccessibleName("Cancel");
  });

  it("calls onConfirm when the primary button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderModal({ onConfirm, onCancel });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel when the secondary button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderModal({ onConfirm, onCancel });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
