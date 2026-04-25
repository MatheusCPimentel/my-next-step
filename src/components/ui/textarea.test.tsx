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

    it("applies the warning color class when count reaches 90% of the limit", async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={10} />);

      await user.type(screen.getByRole("textbox"), "123456789");

      const counter = screen.getByText("9 / 10");
      expect(counter.className).toContain("text-red-500");
    });

    it("uses the muted color class when count is below 90% of the limit", async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={10} />);

      await user.type(screen.getByRole("textbox"), "12345");

      const counter = screen.getByText("5 / 10");
      expect(counter.className).toContain("text-muted");
      expect(counter.className).not.toContain("text-red-500");
    });

    it("passes maxLength to the native textarea so the browser caps input", () => {
      render(<Textarea maxLength={25} />);

      expect(screen.getByRole("textbox")).toHaveAttribute("maxlength", "25");
    });
  });
});
