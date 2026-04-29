import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HistoryDateEditor } from "@/components/JobDialog/components/HistoryDateEditor";

type MatchMediaFn = (query: string) => MediaQueryList;

const ORIGINAL_MATCH_MEDIA = window.matchMedia as MatchMediaFn | undefined;

function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  });
}

function clearMatchMedia() {
  // Remove the property entirely so the component's guard hits.
  Reflect.deleteProperty(window, "matchMedia");
}

afterEach(() => {
  if (ORIGINAL_MATCH_MEDIA) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: ORIGINAL_MATCH_MEDIA,
    });
  } else {
    Reflect.deleteProperty(window, "matchMedia");
  }
});

describe("HistoryDateEditor", () => {
  describe("display (shared render path)", () => {
    beforeEach(() => {
      setMatchMedia(true);
    });

    it("formats the given ISO date as 'MMM d, yyyy'", () => {
      render(
        <HistoryDateEditor
          date="2026-04-27T12:00:00.000Z"
          onChange={() => {}}
        />,
      );

      expect(screen.getByText("Apr 27, 2026")).toBeInTheDocument();
    });

    it("renders a button with aria-label 'Edit date'", () => {
      render(
        <HistoryDateEditor
          date="2026-04-27T12:00:00.000Z"
          onChange={() => {}}
        />,
      );

      expect(
        screen.getByRole("button", { name: /edit date/i }),
      ).toBeInTheDocument();
    });
  });

  describe("desktop branch", () => {
    beforeEach(() => {
      setMatchMedia(true);
    });

    it("opens the calendar popover when the pencil button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <HistoryDateEditor
          date="2026-04-15T12:00:00.000Z"
          onChange={() => {}}
        />,
      );

      expect(screen.queryByRole("grid")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /edit date/i }));

      expect(await screen.findByRole("grid")).toBeInTheDocument();
    });

    it("calls onChange once with an ISO at noon UTC matching the clicked day", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <HistoryDateEditor
          date="2026-04-15T12:00:00.000Z"
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole("button", { name: /edit date/i }));

      const grid = await screen.findByRole("grid");
      // react-day-picker gives each day button an accessible name like
      // "Monday, April 20th, 2026". Match a unique day in April 2026.
      const dayButton = within(grid).getByRole("button", {
        name: /April 20th, 2026/,
      });
      await user.click(dayButton);

      expect(onChange).toHaveBeenCalledTimes(1);
      const arg = onChange.mock.calls[0][0] as string;
      expect(arg).toMatch(/^\d{4}-\d{2}-\d{2}T12:00:00\.000Z$/);
      const day = arg.slice(8, 10);
      expect(day).toBe("20");
    });

    it("returns to the display state after picking a date", async () => {
      const user = userEvent.setup();
      render(
        <HistoryDateEditor
          date="2026-04-15T12:00:00.000Z"
          onChange={() => {}}
        />,
      );

      await user.click(screen.getByRole("button", { name: /edit date/i }));
      const grid = await screen.findByRole("grid");
      const dayButton = within(grid).getByRole("button", {
        name: /April 20th, 2026/,
      });
      await user.click(dayButton);

      expect(
        screen.getByRole("button", { name: /edit date/i }),
      ).toBeInTheDocument();
    });

    it("does not call onChange when the popover closes without a selection", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <HistoryDateEditor
          date="2026-04-15T12:00:00.000Z"
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole("button", { name: /edit date/i }));
      await screen.findByRole("grid");

      await user.keyboard("{Escape}");

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("mobile branch", () => {
    beforeEach(() => {
      setMatchMedia(false);
    });

    it("renders a native date input after clicking the pencil and hides the pencil while editing", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <HistoryDateEditor
          date="2026-04-15T12:00:00.000Z"
          onChange={() => {}}
        />,
      );

      await user.click(screen.getByRole("button", { name: /edit date/i }));

      const input = container.querySelector(
        'input[type="date"]',
      ) as HTMLInputElement | null;
      expect(input).not.toBeNull();
      expect(input!.value).toBe("2026-04-15");
      expect(
        screen.queryByRole("button", { name: /edit date/i }),
      ).not.toBeInTheDocument();
    });

    it("calls onChange once with the ISO noon-UTC string and exits edit mode on change", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <HistoryDateEditor
          date="2026-04-15T12:00:00.000Z"
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole("button", { name: /edit date/i }));

      const input = container.querySelector(
        'input[type="date"]',
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "2026-05-01" } });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("2026-05-01T12:00:00.000Z");
      expect(
        container.querySelector('input[type="date"]'),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /edit date/i }),
      ).toBeInTheDocument();
    });

    it("exits edit mode on blur without calling onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <HistoryDateEditor
          date="2026-04-15T12:00:00.000Z"
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole("button", { name: /edit date/i }));

      const input = container.querySelector(
        'input[type="date"]',
      ) as HTMLInputElement;
      fireEvent.blur(input);

      expect(onChange).not.toHaveBeenCalled();
      expect(
        container.querySelector('input[type="date"]'),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /edit date/i }),
      ).toBeInTheDocument();
    });

    it("normalizes the picked date to noon UTC even when the inbound date is not noon", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <HistoryDateEditor
          date="2026-04-15T03:30:00.000Z"
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole("button", { name: /edit date/i }));
      const input = container.querySelector(
        'input[type="date"]',
      ) as HTMLInputElement;
      // toYMD reads UTC parts, so inbound 03:30 still shows the same Y-M-D.
      expect(input.value).toBe("2026-04-15");

      fireEvent.change(input, { target: { value: "2026-04-22" } });

      // The picked day forces noon UTC regardless of the inbound 03:30 time.
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("2026-04-22T12:00:00.000Z");
    });

    it("does not call onChange when the input value is cleared to empty", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <HistoryDateEditor
          date="2026-04-15T12:00:00.000Z"
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole("button", { name: /edit date/i }));

      const input = container.querySelector(
        'input[type="date"]',
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "" } });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("matchMedia guard", () => {
    it("renders without throwing and defaults to desktop when window.matchMedia is undefined", () => {
      clearMatchMedia();

      expect(() =>
        render(
          <HistoryDateEditor
            date="2026-04-27T12:00:00.000Z"
            onChange={() => {}}
          />,
        ),
      ).not.toThrow();

      expect(screen.getByText("Apr 27, 2026")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /edit date/i }),
      ).toBeInTheDocument();
    });
  });
});
