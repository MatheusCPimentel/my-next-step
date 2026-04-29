import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LevelUp } from "@/pages/LevelUp";

function getStatValue(label: string): string {
  const labelEl = screen.getByText(label);
  const card = labelEl.parentElement!;
  const valueEl = within(card).getByText(/^\d+$/);
  return valueEl.textContent ?? "";
}

describe("LevelUp", () => {
  it("renders the page title", () => {
    render(<LevelUp />);

    expect(
      screen.getByRole("heading", { name: /level up/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders all three categories", () => {
    render(<LevelUp />);

    expect(
      screen.getByRole("button", { name: /^algorithms\d*$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^system design\d*$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^behavioral\d*$/i }),
    ).toBeInTheDocument();
  });

  it("expands a collapsed category when its header is clicked", async () => {
    const user = userEvent.setup();
    render(<LevelUp />);

    expect(
      screen.queryByText(/disagreed with a senior engineer/i),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^behavioral\d*$/i }));

    expect(
      screen.getByText(/disagreed with a senior engineer/i),
    ).toBeInTheDocument();
  });

  it("flips aria-checked on a weak point's checkbox when clicked", async () => {
    const user = userEvent.setup();
    render(<LevelUp />);

    await user.click(screen.getByRole("button", { name: /^algorithms\d*$/i }));

    const checkbox = screen.getByRole("checkbox", {
      name: /mark "how would you find the longest substring without repeating characters\?" as mastered/i,
    });
    expect(checkbox).toHaveAttribute("aria-checked", "false");

    await user.click(checkbox);

    const toggled = screen.getByRole("checkbox", {
      name: /mark "how would you find the longest substring without repeating characters\?" as not mastered/i,
    });
    expect(toggled).toHaveAttribute("aria-checked", "true");
  });

  it("un-masters a previously mastered weak point on a second click", async () => {
    const user = userEvent.setup();
    render(<LevelUp />);

    await user.click(screen.getByRole("button", { name: /^algorithms\d*$/i }));

    const checkbox = screen.getByRole("checkbox", {
      name: /mark "explain how a binary search tree's in-order traversal produces a sorted sequence\." as not mastered/i,
    });
    expect(checkbox).toHaveAttribute("aria-checked", "true");

    await user.click(checkbox);

    const toggled = screen.getByRole("checkbox", {
      name: /mark "explain how a binary search tree's in-order traversal produces a sorted sequence\." as mastered/i,
    });
    expect(toggled).toHaveAttribute("aria-checked", "false");
  });

  describe("stat counts", () => {
    it("renders Open / Mastered / From rejections from the mock data", () => {
      render(<LevelUp />);

      expect(getStatValue("Open points")).toBe("5");
      expect(getStatValue("Mastered")).toBe("1");
      expect(getStatValue("From rejections")).toBe("6");
    });

    it("updates Open and Mastered counts when a checkbox is clicked", async () => {
      const user = userEvent.setup();
      render(<LevelUp />);

      await user.click(screen.getByRole("button", { name: /^algorithms\d*$/i }));
      await user.click(
        screen.getByRole("checkbox", {
          name: /mark "how would you find the longest substring without repeating characters\?" as mastered/i,
        }),
      );

      expect(getStatValue("Open points")).toBe("4");
      expect(getStatValue("Mastered")).toBe("2");
      expect(getStatValue("From rejections")).toBe("6");
    });
  });

  describe("with fake timers", () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("decrements From rejections when a weak point is removed", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<LevelUp />);

      await user.click(screen.getByRole("button", { name: /^algorithms\d*$/i }));
      await user.click(
        screen.getByRole("button", {
          name: /remove "how would you find the longest substring without repeating characters\?"/i,
        }),
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(250);
      });

      expect(getStatValue("From rejections")).toBe("5");
    });

    it("removes a weak point when 'Remove' is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<LevelUp />);

      await user.click(screen.getByRole("button", { name: /^algorithms\d*$/i }));

      const removeButton = screen.getByRole("button", {
        name: /remove "how would you find the longest substring without repeating characters\?"/i,
      });
      await user.click(removeButton);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(250);
      });

      expect(
        screen.queryByText(/longest substring/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("edit mode", () => {
    it("updates the rendered question after typing and saving", async () => {
      const user = userEvent.setup();
      render(<LevelUp />);

      await user.click(screen.getByRole("button", { name: /^algorithms\d*$/i }));
      await user.click(
        screen.getByRole("button", {
          name: /edit "how would you find the longest substring without repeating characters\?"/i,
        }),
      );

      const questionInput = screen.getByDisplayValue(
        /how would you find the longest substring without repeating characters\?/i,
      );
      await user.clear(questionInput);
      await user.type(questionInput, "Updated algorithms question");
      await user.click(screen.getByRole("button", { name: /^save$/i }));

      expect(
        screen.getByText("Updated algorithms question"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/longest substring/i),
      ).not.toBeInTheDocument();
    });

    it("closes the edit area without changes when Cancel is clicked", async () => {
      const user = userEvent.setup();
      render(<LevelUp />);

      await user.click(screen.getByRole("button", { name: /^algorithms\d*$/i }));
      await user.click(
        screen.getByRole("button", {
          name: /edit "how would you find the longest substring without repeating characters\?"/i,
        }),
      );

      const questionInput = screen.getByDisplayValue(
        /how would you find the longest substring without repeating characters\?/i,
      );
      await user.clear(questionInput);
      await user.type(questionInput, "Should be discarded");
      await user.click(screen.getByRole("button", { name: /^cancel$/i }));

      expect(
        screen.queryByRole("button", { name: /^save$/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(
          /how would you find the longest substring without repeating characters\?/i,
        ),
      ).toBeInTheDocument();
      expect(screen.queryByText("Should be discarded")).not.toBeInTheDocument();
    });

    it("updates the rendered answer after typing and saving", async () => {
      const user = userEvent.setup();
      render(<LevelUp />);

      await user.click(screen.getByRole("button", { name: /^algorithms\d*$/i }));
      await user.click(
        screen.getByRole("button", {
          name: /edit "how would you find the longest substring without repeating characters\?"/i,
        }),
      );

      const answerTextarea = screen.getByDisplayValue(/use a sliding window/i);
      await user.clear(answerTextarea);
      await user.type(answerTextarea, "A fresh updated answer");
      await user.click(screen.getByRole("button", { name: /^save$/i }));

      expect(screen.getByText("A fresh updated answer")).toBeInTheDocument();
      expect(
        screen.queryByText(/use a sliding window/i),
      ).not.toBeInTheDocument();
    });
  });
});
