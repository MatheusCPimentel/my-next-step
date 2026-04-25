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

    it("forwards onChange events to the caller", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Textarea onChange={onChange} />);

      await user.type(screen.getByRole("textbox"), "hi");

      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it("ignores the error prop when maxLength is not set", () => {
      render(<Textarea error="should be hidden" />);

      expect(screen.queryByText("should be hidden")).not.toBeInTheDocument();
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

    it("does not pass the native maxLength attribute (allows over-typing)", async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={5} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).not.toHaveAttribute("maxlength");

      await user.type(textarea, "abcdefgh");

      expect(screen.getByText("8 / 5")).toBeInTheDocument();
      expect((textarea as HTMLTextAreaElement).value).toBe("abcdefgh");
    });
  });

  describe("with error prop", () => {
    it("renders the error message alongside the counter", () => {
      render(<Textarea maxLength={50} error="Required field" defaultValue="hi" />);

      expect(screen.getByText("Required field")).toBeInTheDocument();
      expect(screen.getByText("2 / 50")).toBeInTheDocument();
    });

    it("does not render an error message when error is omitted", () => {
      render(<Textarea maxLength={50} defaultValue="hi" />);

      expect(screen.queryByText("Required field")).not.toBeInTheDocument();
    });

    it("does not render an error message when error is an empty string", () => {
      render(<Textarea maxLength={50} error="" defaultValue="hi" />);

      expect(screen.queryByText("Required field")).not.toBeInTheDocument();
    });
  });
});
