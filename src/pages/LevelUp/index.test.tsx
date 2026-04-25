import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LevelUp } from "@/pages/LevelUp";

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

  it("toggles the mastered visual on a weak point when its checkbox is clicked", async () => {
    const user = userEvent.setup();
    render(<LevelUp />);

    await user.click(screen.getByRole("button", { name: /^algorithms\d*$/i }));

    const checkbox = screen.getByRole("checkbox", {
      name: /mark "how would you find the longest substring without repeating characters\?" as mastered/i,
    });
    await user.click(checkbox);

    const questionText = screen.getByText(/longest substring/i);
    expect(questionText.className).toContain("line-through");
  });

  it("fades out and removes a weak point when 'Remove' is clicked", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
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

    vi.useRealTimers();
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
  });
});
