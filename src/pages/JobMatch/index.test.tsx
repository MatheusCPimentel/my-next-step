import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast as sonnerToast } from "sonner";
import { JobMatch } from "@/pages/JobMatch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  // Sonner's swipe-to-dismiss calls setPointerCapture/releasePointerCapture on
  // pointerdown; JSDOM does not implement these. Stub them to avoid unhandled
  // errors when interacting with toast action buttons.
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = vi.fn();
  }
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = vi.fn(() => false);
  }
});

beforeEach(() => {
  mockNavigate.mockClear();
});

afterEach(() => {
  sonnerToast.dismiss();
});

function renderJobMatch() {
  return render(
    <>
      <JobMatch />
      <Toaster />
    </>,
    {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <TooltipProvider>{children}</TooltipProvider>
        </MemoryRouter>
      ),
    },
  );
}

describe("JobMatch", () => {
  it("shows both validation errors and does not enter loading when submitting empty", async () => {
    const user = userEvent.setup();
    renderJobMatch();

    await user.click(screen.getByRole("button", { name: /^analyze$/i }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(
      screen.queryByText(/reading job description/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("/ 100")).not.toBeInTheDocument();
  });

  it("renders the Additional context textarea on idle", () => {
    renderJobMatch();
    expect(
      screen.getByPlaceholderText(
        /Anything the job description doesn't cover/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders the explainer with 'How it works' on idle", () => {
    renderJobMatch();
    expect(screen.getByText("How it works")).toBeInTheDocument();
  });

  it("disables the Analyze button when description exceeds 8000 characters", () => {
    renderJobMatch();

    const description = screen.getByPlaceholderText(
      "Paste the full job description here...",
    );
    fireEvent.change(description, { target: { value: "a".repeat(8001) } });

    expect(screen.getByRole("button", { name: /^analyze$/i })).toBeDisabled();
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
      renderJobMatch();

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
      expect(screen.queryByText("Strong fit")).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(/Senior Frontend Engineer at Acme/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(/Paste the full job description/i),
      ).not.toBeInTheDocument();
    });

    it("returns to the form and clears input when 'Analyze another job' is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderJobMatch();

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

    it("renders the Add to Board button at the top of the result after analyze", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderJobMatch();

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
        screen.getByRole("button", { name: /add to board/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /analyze another job/i }),
      ).toBeInTheDocument();
    });

    it("renders the Info trigger beside Why am I a fit", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderJobMatch();

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
        screen.getByRole("button", { name: /why am i a fit/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /what does this generate/i }),
      ).toBeInTheDocument();
    });

    it("opens JobDialog in create mode pre-filled with the submitted title when 'Add to Board' is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderJobMatch();

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

    it("renders the pitch text after Why am I a fit completes", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderJobMatch();

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
        screen.getByRole("button", { name: /why am i a fit/i }),
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      expect(screen.getByText(/strong fit for this role/i)).toBeInTheDocument();
    });

    it("clears the Additional context textarea on 'Analyze another job'", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderJobMatch();

      await user.type(
        screen.getByPlaceholderText("Senior Frontend Engineer at Acme"),
        "Senior Frontend Engineer",
      );
      await user.type(
        screen.getByPlaceholderText("Paste the full job description here..."),
        "Build great products.",
      );
      await user.type(
        screen.getByPlaceholderText(
          /Anything the job description doesn't cover/i,
        ),
        "Recruiter said budget is flexible",
      );
      await user.click(screen.getByRole("button", { name: /^analyze$/i }));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      await user.click(
        screen.getByRole("button", { name: /analyze another job/i }),
      );

      const additional = screen.getByPlaceholderText(
        /Anything the job description doesn't cover/i,
      ) as HTMLTextAreaElement;
      expect(additional.value).toBe("");
    });
  });

  describe("Copy pitch", () => {
    type ClipboardDescriptor = PropertyDescriptor | undefined;
    let originalClipboard: ClipboardDescriptor;

    function mockClipboard(writeText: ReturnType<typeof vi.fn>) {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
      });
    }

    beforeEach(() => {
      originalClipboard = Object.getOwnPropertyDescriptor(
        navigator,
        "clipboard",
      );
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
      if (originalClipboard) {
        Object.defineProperty(navigator, "clipboard", originalClipboard);
      } else {
        Reflect.deleteProperty(navigator as object, "clipboard");
      }
    });

    async function advanceToPitchReady(user: ReturnType<typeof userEvent.setup>) {
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

      await user.click(screen.getByRole("button", { name: /why am i a fit/i }));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
    }

    it("calls clipboard.writeText with the pitch when the copy button is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const writeText = vi.fn().mockResolvedValue(undefined);
      mockClipboard(writeText);
      renderJobMatch();
      await advanceToPitchReady(user);

      await user.click(
        screen.getByRole("button", { name: /copy pitch to clipboard/i }),
      );

      expect(writeText).toHaveBeenCalledTimes(1);
      // Successful copies use the in-place check-icon flip (5s) for feedback;
      // no toast is fired on the happy path.
      expect(
        screen.queryByText(/copied to clipboard/i),
      ).not.toBeInTheDocument();
    });

    it("shows error toast when clipboard write rejects", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const writeText = vi.fn().mockRejectedValue(new Error("denied"));
      mockClipboard(writeText);
      renderJobMatch();
      await advanceToPitchReady(user);

      await user.click(
        screen.getByRole("button", { name: /copy pitch to clipboard/i }),
      );

      expect(writeText).toHaveBeenCalledTimes(1);
      expect(await screen.findByText(/could not copy/i)).toBeInTheDocument();
    });
  });

  describe("Add to Board confirmation modal", () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    async function advanceToDone(user: ReturnType<typeof userEvent.setup>) {
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
    }

    async function openDialogAndSave(user: ReturnType<typeof userEvent.setup>) {
      await advanceToDone(user);
      await user.click(screen.getByRole("button", { name: /add to board/i }));

      // The JobDialog opens pre-filled with the submitted title, description,
      // and MOCK_RESULT.requiredSkills — only company is missing.
      await user.type(screen.getByPlaceholderText("Company name"), "Acme");
      await user.click(screen.getByRole("button", { name: /^save$/i }));
    }

    it("opens a confirmation modal with both actions after JobDialog Save", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderJobMatch();

      await openDialogAndSave(user);

      expect(
        await screen.findByRole("heading", { name: /job added to board/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /go to board/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /add another job/i }),
      ).toBeInTheDocument();
    });

    it("does not render a close (X) button on the confirmation modal", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderJobMatch();

      await openDialogAndSave(user);

      await screen.findByRole("heading", { name: /job added to board/i });
      // shadcn DialogContent renders the X with sr-only label "Close" when
      // showCloseButton is true. With showCloseButton={false}, no such button
      // should exist on the confirmation modal.
      expect(
        screen.queryByRole("button", { name: /^close$/i }),
      ).not.toBeInTheDocument();
    });

    it("navigates to /board when Go to Board is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderJobMatch();

      await openDialogAndSave(user);

      await screen.findByRole("heading", { name: /job added to board/i });
      await user.click(screen.getByRole("button", { name: /go to board/i }));

      expect(mockNavigate).toHaveBeenCalledWith("/board");
    });

    it("closes the modal and resets the form to idle when Add another job is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderJobMatch();

      await openDialogAndSave(user);

      await screen.findByRole("heading", { name: /job added to board/i });
      await user.click(screen.getByRole("button", { name: /add another job/i }));

      expect(
        screen.queryByRole("heading", { name: /job added to board/i }),
      ).not.toBeInTheDocument();
      const titleInput = screen.getByPlaceholderText(
        "Senior Frontend Engineer at Acme",
      ) as HTMLInputElement;
      expect(titleInput.value).toBe("");
      expect(
        screen.getByRole("button", { name: /^analyze$/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Resume Analyzer gate", () => {
    it("renders the gate card title and CTA on initial load", () => {
      renderJobMatch();

      expect(
        screen.getByRole("heading", { name: /analyze your resume first/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /analyze my resume/i }),
      ).toBeInTheDocument();
    });

    it("navigates to /resume when the CTA is clicked", async () => {
      const user = userEvent.setup();
      renderJobMatch();

      await user.click(
        screen.getByRole("button", { name: /analyze my resume/i }),
      );

      expect(mockNavigate).toHaveBeenCalledWith("/resume");
    });
  });
});
