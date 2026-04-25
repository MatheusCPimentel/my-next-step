import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea", () => {
  describe("without maxLength", () => {
    it("renders no counter when maxLength is omitted", () => {
      render(<Textarea defaultValue="hello" />);

      expect(screen.queryByText(/\d+\s*\/\s*\d+/)).not.toBeInTheDocument();
    });

    it("does not wrap the textarea in a div when maxLength is omitted", () => {
      const { container } = render(<Textarea data-testid="ta" />);

      expect(container.firstChild).toBe(screen.getByTestId("ta"));
    });

    it("forwards onChange events without a wrapper", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Textarea onChange={onChange} />);

      await user.type(screen.getByRole("textbox"), "hi");

      expect(onChange).toHaveBeenCalledTimes(2);
    });
  });

  describe("with maxLength", () => {
    it("renders the counter starting at 0 / max for an empty textarea", () => {
      render(<Textarea maxLength={50} />);

      expect(screen.getByText("0 / 50")).toBeInTheDocument();
    });

    it("initializes the counter from defaultValue length", () => {
      render(<Textarea maxLength={50} defaultValue="hello" />);

      expect(screen.getByText("5 / 50")).toBeInTheDocument();
    });

    it("initializes the counter from controlled value length", () => {
      render(<Textarea maxLength={50} value="hi there" onChange={() => {}} />);

      expect(screen.getByText("8 / 50")).toBeInTheDocument();
    });

    it("updates the counter as the user types", async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={50} />);

      await user.type(screen.getByRole("textbox"), "abc");

      expect(screen.getByText("3 / 50")).toBeInTheDocument();
    });

    it("calls the user's onChange handler in addition to updating the counter", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      function Wrapper() {
        const [value, setValue] = useState("");
        return (
          <Textarea
            maxLength={50}
            value={value}
            onChange={(e) => {
              onChange(e);
              setValue(e.target.value);
            }}
          />
        );
      }

      render(<Wrapper />);

      await user.type(screen.getByRole("textbox"), "ab");

      expect(onChange).toHaveBeenCalledTimes(2);
      expect(screen.getByText("2 / 50")).toBeInTheDocument();
    });

    it("applies the warning color class when count reaches the limit exactly", async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={10} />);

      await user.type(screen.getByRole("textbox"), "1234567890");

      const counter = screen.getByText("10 / 10");
      expect(counter.className).toContain("text-red-500");
    });

    it("uses the muted color class when count is below the limit", async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={10} />);

      await user.type(screen.getByRole("textbox"), "12345678");

      const counter = screen.getByText("8 / 10");
      expect(counter.className).toContain("text-muted");
      expect(counter.className).not.toContain("text-red-500");
    });

    it("does not pass the native maxLength attribute (allows over-typing)", async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={5} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).not.toHaveAttribute("maxlength");

      await user.type(textarea, "abcdefgh");

      expect(screen.getByText("8 / 5")).toBeInTheDocument();
      expect((textarea as HTMLTextAreaElement).value).toBe("abcdefgh");
    });

    it("swaps the textarea border to red when count exceeds the limit", async () => {
      const user = userEvent.setup();
      render(
        <Textarea
          data-testid="ta"
          maxLength={3}
          className="border border-border rounded-lg"
        />,
      );

      const textarea = screen.getByTestId("ta");
      await user.type(textarea, "abcd");

      expect(textarea.className).toContain("border-red-500");
      expect(textarea.className).not.toContain("border-border");
    });

    it("keeps the original border when count is exactly at the limit", async () => {
      const user = userEvent.setup();
      render(
        <Textarea
          data-testid="ta"
          maxLength={3}
          className="border border-border rounded-lg"
        />,
      );

      const textarea = screen.getByTestId("ta");
      await user.type(textarea, "abc");

      expect(textarea.className).not.toContain("border-red-500");
      expect(textarea.className).toContain("border-border");
    });

    it("renders the counter below the textarea (not absolutely positioned)", () => {
      const { container } = render(
        <Textarea data-testid="ta" maxLength={50} defaultValue="hi" />,
      );

      const counterRow = screen.getByText("2 / 50").parentElement!;
      const textarea = screen.getByTestId("ta");

      expect(counterRow.className).not.toContain("absolute");
      expect(counterRow.className).toContain("mt-1");
      expect(container.querySelector(".relative")).toBeNull();
      expect(textarea.nextElementSibling).toBe(counterRow);
    });
  });
});
