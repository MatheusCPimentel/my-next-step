import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Stepper } from "@/components/Stepper";

const steps = [
  { label: "Upload" },
  { label: "Review" },
  { label: "Confirm" },
];

const getCircle = (label: string) => {
  const labelEl = screen.getByText(label);
  return labelEl.previousElementSibling as HTMLElement;
};

const getConnectors = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("div.h-px"));

describe("Stepper", () => {
  it("renders every step label from the steps array", () => {
    render(<Stepper steps={steps} currentStep={1} />);

    for (const step of steps) {
      expect(screen.getByText(step.label)).toBeInTheDocument();
    }
  });

  describe("when currentStep is 1 (first active, none completed)", () => {
    it("highlights only the active step's label as primary and others as muted", () => {
      render(<Stepper steps={steps} currentStep={1} />);

      expect(screen.getByText("Upload")).toHaveClass("text-primary");
      expect(screen.getByText("Review")).toHaveClass("text-muted");
      expect(screen.getByText("Confirm")).toHaveClass("text-muted");
    });

    it("renders the active circle with bg-purple and the step number", () => {
      render(<Stepper steps={steps} currentStep={1} />);

      const circle = getCircle("Upload");
      expect(circle).toHaveClass("bg-purple");
      expect(circle).toHaveTextContent("1");
    });

    it("renders pending circles with bg-overlay and their step number", () => {
      render(<Stepper steps={steps} currentStep={1} />);

      const second = getCircle("Review");
      const third = getCircle("Confirm");

      expect(second).toHaveClass("bg-overlay");
      expect(second).toHaveTextContent("2");
      expect(third).toHaveClass("bg-overlay");
      expect(third).toHaveTextContent("3");
    });

    it("does not render any check icon when no step is completed", () => {
      const { container } = render(<Stepper steps={steps} currentStep={1} />);

      expect(container.querySelector("svg")).toBeNull();
    });
  });

  describe("when currentStep is 2 (one completed, one active, rest pending)", () => {
    it("renders the completed circle with bg-teal/20 and a check icon (no number)", () => {
      render(<Stepper steps={steps} currentStep={2} />);

      const circle = getCircle("Upload");
      expect(circle).toHaveClass("bg-teal/20");
      expect(circle.querySelector("svg")).not.toBeNull();
      expect(circle).not.toHaveTextContent("1");
    });

    it("renders the active circle with bg-purple and the step number", () => {
      render(<Stepper steps={steps} currentStep={2} />);

      const circle = getCircle("Review");
      expect(circle).toHaveClass("bg-purple");
      expect(circle).toHaveTextContent("2");
    });

    it("renders the remaining pending circle with bg-overlay and its number", () => {
      render(<Stepper steps={steps} currentStep={2} />);

      const circle = getCircle("Confirm");
      expect(circle).toHaveClass("bg-overlay");
      expect(circle).toHaveTextContent("3");
    });
  });

  describe("connectors", () => {
    it("renders the connector before a completed step as bg-teal", () => {
      const { container } = render(<Stepper steps={steps} currentStep={2} />);
      const [firstConnector] = getConnectors(container);

      expect(firstConnector).toHaveClass("bg-teal");
    });

    it("renders the connector after the active step as bg-border when no later step is completed", () => {
      const { container } = render(<Stepper steps={steps} currentStep={1} />);
      const [firstConnector, secondConnector] = getConnectors(container);

      expect(firstConnector).toHaveClass("bg-border");
      expect(secondConnector).toHaveClass("bg-border");
    });

    it("renders one fewer connector than the number of steps", () => {
      const { container } = render(<Stepper steps={steps} currentStep={1} />);

      expect(getConnectors(container)).toHaveLength(steps.length - 1);
    });
  });

  describe("when currentStep exceeds the number of steps", () => {
    it("renders every circle in the completed state with a check icon", () => {
      render(<Stepper steps={steps} currentStep={steps.length + 1} />);

      for (const step of steps) {
        const circle = getCircle(step.label);
        expect(circle).toHaveClass("bg-teal/20");
        expect(circle.querySelector("svg")).not.toBeNull();
      }
    });

    it("renders every connector as bg-teal", () => {
      const { container } = render(
        <Stepper steps={steps} currentStep={steps.length + 1} />,
      );

      for (const connector of getConnectors(container)) {
        expect(connector).toHaveClass("bg-teal");
      }
    });
  });

  describe("onClick", () => {
    it("does not render completed circles as buttons when onClick is omitted", () => {
      render(<Stepper steps={steps} currentStep={3} />);

      expect(getCircle("Upload")).not.toHaveAttribute("type", "button");
      expect(getCircle("Review")).not.toHaveAttribute("type", "button");
    });

    it("renders completed circles as buttons when onClick is provided", () => {
      render(<Stepper steps={steps} currentStep={3} onClick={vi.fn()} />);

      expect(getCircle("Upload").tagName).toBe("BUTTON");
      expect(getCircle("Upload")).toHaveAttribute("type", "button");
      expect(getCircle("Review").tagName).toBe("BUTTON");
      expect(getCircle("Review")).toHaveAttribute("type", "button");
    });

    it("invokes onClick with the 1-indexed step number when a completed circle is clicked", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Stepper steps={steps} currentStep={3} onClick={onClick} />);

      await user.click(getCircle("Upload"));
      expect(onClick).toHaveBeenCalledWith(1);

      await user.click(getCircle("Review"));
      expect(onClick).toHaveBeenCalledWith(2);
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it("does not make the active circle interactive even when onClick is provided", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Stepper steps={steps} currentStep={2} onClick={onClick} />);

      const active = getCircle("Review");
      expect(active.tagName).not.toBe("BUTTON");

      await user.click(active);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("does not make pending circles interactive even when onClick is provided", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Stepper steps={steps} currentStep={1} onClick={onClick} />);

      const second = getCircle("Review");
      const third = getCircle("Confirm");

      expect(second.tagName).not.toBe("BUTTON");
      expect(third.tagName).not.toBe("BUTTON");

      await user.click(second);
      await user.click(third);
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
