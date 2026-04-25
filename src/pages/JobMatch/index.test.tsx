import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobMatch } from "@/pages/JobMatch";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe("JobMatch", () => {
  it("shows both validation errors and does not enter loading when submitting empty", async () => {
    const user = userEvent.setup();
    render(<JobMatch />);

    await user.click(screen.getByRole("button", { name: /^analyze$/i }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(
      screen.queryByText(/reading job description/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/final verdict/i)).not.toBeInTheDocument();
  });

  describe("with fake timers", () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("shows the loading state then reveals the result section", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<JobMatch />);

      await user.type(
        screen.getByPlaceholderText("Senior Frontend Engineer at Acme"),
        "Senior Frontend Engineer",
      );
      await user.type(
        screen.getByPlaceholderText("Paste the full job description here..."),
        "Build great products with React and TypeScript.",
      );
      await user.click(screen.getByRole("button", { name: /^analyze$/i }));

      expect(
        screen.getByText(/reading job description/i),
      ).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      expect(
        screen.queryByText(/reading job description/i),
      ).not.toBeInTheDocument();
      expect(screen.getByText("78")).toBeInTheDocument();
      expect(screen.getByText(/Good fit overall/i)).toBeInTheDocument();
      expect(screen.getByText("72")).toBeInTheDocument();
      expect(screen.getByText("/ 100")).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(/Senior Frontend Engineer at Acme/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(/Paste the full job description/i),
      ).not.toBeInTheDocument();
    });

    it("returns to the form and clears input when 'Analyze another job' is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<JobMatch />);

      await user.type(
        screen.getByPlaceholderText("Senior Frontend Engineer at Acme"),
        "Senior Frontend Engineer",
      );
      await user.type(
        screen.getByPlaceholderText("Paste the full job description here..."),
        "Build great products with React and TypeScript.",
      );
      await user.click(screen.getByRole("button", { name: /^analyze$/i }));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      await user.click(
        screen.getByRole("button", { name: /analyze another job/i }),
      );

      const titleInput = screen.getByPlaceholderText(
        "Senior Frontend Engineer at Acme",
      ) as HTMLInputElement;
      expect(titleInput).toBeInTheDocument();
      expect(titleInput.value).toBe("");
      expect(screen.queryByText(/Job overview/i)).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /analyze another job/i }),
      ).not.toBeInTheDocument();
    });

    // score is hardcoded; only the positive case is exercisable today
    it("renders the 'Generate why I am a great fit' button after analyze", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<JobMatch />);

      await user.type(
        screen.getByPlaceholderText("Senior Frontend Engineer at Acme"),
        "Senior Frontend Engineer",
      );
      await user.type(
        screen.getByPlaceholderText("Paste the full job description here..."),
        "Build great products with React and TypeScript.",
      );
      await user.click(screen.getByRole("button", { name: /^analyze$/i }));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      expect(
        screen.getByRole("button", { name: /generate why i am a great fit/i }),
      ).toBeInTheDocument();
    });

    it("opens JobDialog in create mode pre-filled with the submitted title when 'Add to Board' is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<JobMatch />);

      const submittedTitle = "Senior Frontend Engineer";
      await user.type(
        screen.getByPlaceholderText("Senior Frontend Engineer at Acme"),
        submittedTitle,
      );
      await user.type(
        screen.getByPlaceholderText("Paste the full job description here..."),
        "Build great products with React and TypeScript.",
      );
      await user.click(screen.getByRole("button", { name: /^analyze$/i }));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      await user.click(screen.getByRole("button", { name: /add to board/i }));

      expect(screen.getByText("Create job")).toBeInTheDocument();
      const dialogTitleInput = screen.getByPlaceholderText(
        "Job title",
      ) as HTMLInputElement;
      expect(dialogTitleInput.value).toBe(submittedTitle);
    });
  });
});
