import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ResumeAnalyzer } from "@/pages/ResumeAnalyzer";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderResumeAnalyzer() {
  return render(<ResumeAnalyzer />, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

function makePdf(name = "resume.pdf") {
  return new File(["%PDF-1.4 sample"], name, { type: "application/pdf" });
}

function selectFile(file: File) {
  const input = document.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  Object.defineProperty(input, "files", {
    value: [file],
    configurable: true,
  });
  fireEvent.change(input);
}

async function advanceToAnalysis(user: ReturnType<typeof userEvent.setup>) {
  selectFile(makePdf());
  await user.click(screen.getByRole("button", { name: /analyze resume/i }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2500);
  });
}

async function openModal(user: ReturnType<typeof userEvent.setup>) {
  await advanceToAnalysis(user);
  await user.click(screen.getByRole("button", { name: /confirm profile/i }));
  await screen.findByRole("dialog");
}

describe("ResumeAnalyzer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Upload screen", () => {
    it("renders the page title and upload copy", () => {
      renderResumeAnalyzer();

      expect(
        screen.getByRole("heading", { name: /resume analyzer/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /upload your resume and get ai-powered feedback instantly/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/drop your resume here or click to browse/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/pdf only · max 10mb/i)).toBeInTheDocument();
      expect(screen.getByText("What we analyze")).toBeInTheDocument();
    });

    it("hides the Confirm profile button on the upload screen", () => {
      renderResumeAnalyzer();

      expect(
        screen.queryByRole("button", { name: /confirm profile/i }),
      ).not.toBeInTheDocument();
    });

    it("disables the Analyze button when no file has been selected", () => {
      renderResumeAnalyzer();

      expect(
        screen.getByRole("button", { name: /analyze resume/i }),
      ).toBeDisabled();
    });

    it("shows the file name and enables the Analyze button after selecting a file", () => {
      renderResumeAnalyzer();

      selectFile(makePdf("my-cv.pdf"));

      expect(screen.getByText("my-cv.pdf")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /analyze resume/i }),
      ).toBeEnabled();
    });

    it("removes the selected file and disables Analyze when the X is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      selectFile(makePdf("my-cv.pdf"));
      await user.click(screen.getByRole("button", { name: /remove file/i }));

      expect(screen.queryByText("my-cv.pdf")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /analyze resume/i }),
      ).toBeDisabled();
    });
  });

  describe("Analyzing overlay", () => {
    it("shows the first loading message and cycles to the next after 600ms", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      selectFile(makePdf());
      await user.click(screen.getByRole("button", { name: /analyze resume/i }));

      expect(screen.getByText(/reading your resume/i)).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(600);
      });

      expect(screen.getByText(/analyzing experience/i)).toBeInTheDocument();
    });

    it("advances to the analysis screen after 2.5 seconds with the section cards and Confirm profile button", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      selectFile(makePdf());
      await user.click(screen.getByRole("button", { name: /analyze resume/i }));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2500);
      });

      expect(
        screen.getByRole("button", { name: /confirm profile/i }),
      ).toBeInTheDocument();
      // Mobile and desktop layouts both mount in JSDOM, so each card renders twice.
      expect(
        screen.getAllByRole("heading", { name: /ai resume verdict/i }),
      ).toHaveLength(2);
      expect(
        screen.getAllByRole("heading", { name: /ats score/i }),
      ).toHaveLength(2);
      expect(
        screen.getAllByRole("heading", { name: /^strengths$/i }),
      ).toHaveLength(2);
      expect(
        screen.getAllByRole("heading", { name: /^weaknesses$/i }),
      ).toHaveLength(2);
      expect(
        screen.getAllByRole("heading", { name: /attention points/i }),
      ).toHaveLength(2);
      expect(
        screen.getAllByRole("heading", { name: /^suggestions$/i }),
      ).toHaveLength(2);
      expect(
        screen.getAllByRole("heading", { name: /top skills/i }),
      ).toHaveLength(2);
      expect(
        screen.queryByText(/reading your resume/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Analysis content", () => {
    it("renders all six skill names and the extreme percentage values in the Top skills card", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToAnalysis(user);

      // Mobile and desktop layouts both mount in JSDOM, so each card renders twice.
      for (const skill of [
        "React",
        "TypeScript",
        "Node.js",
        "CSS / Tailwind",
        "Testing",
        "System design",
      ]) {
        expect(screen.getAllByText(skill)).toHaveLength(2);
      }
      expect(screen.getAllByText("92%")).toHaveLength(2);
      expect(screen.getAllByText("48%")).toHaveLength(2);
    });

    it("renders the ATS score, badge, and explanation paragraph", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToAnalysis(user);

      // Mobile and desktop layouts both mount in JSDOM, so the card renders twice.
      expect(screen.getAllByText("72")).toHaveLength(2);
      expect(screen.getAllByText("Good")).toHaveLength(2);
      expect(
        screen.getAllByText(/adding more role-specific keywords/i),
      ).toHaveLength(2);
    });
  });

  describe("Confirm profile modal", () => {
    it("opens the modal with the title when Confirm profile is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await openModal(user);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /^your profile$/i }),
      ).toBeInTheDocument();
    });

    it("renders the summary and both action buttons", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await openModal(user);

      expect(
        screen.getByText(
          /this is what the ai understood about you\. confirm or adjust before saving/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /senior frontend engineer with 5 years of experience in react and typescript/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /why this matters/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /looks good, save/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /i want to adjust/i }),
      ).toBeInTheDocument();
    });

    it("resets the adjust panel when the modal is closed and reopened", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await openModal(user);
      await user.click(
        screen.getByRole("button", { name: /i want to adjust/i }),
      );
      const textarea = screen.getByPlaceholderText(
        /describe what you want to change or add/i,
      );
      await user.type(textarea, "some draft text");

      await user.keyboard("{Escape}");
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200);
      });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: /confirm profile/i }),
      );
      await screen.findByRole("dialog");

      expect(
        screen.queryByPlaceholderText(
          /describe what you want to change or add/i,
        ),
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: /i want to adjust/i }),
      );
      const reopenedTextarea = screen.getByPlaceholderText(
        /describe what you want to change or add/i,
      );
      expect(reopenedTextarea).toHaveValue("");
    });

    it("opening the adjust panel hides the default action buttons and reveals Cancel + Re-evaluate", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await openModal(user);
      await user.click(
        screen.getByRole("button", { name: /i want to adjust/i }),
      );

      expect(
        screen.queryByRole("button", { name: /looks good, save/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /i want to adjust/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^cancel$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^re-evaluate$/i }),
      ).toBeInTheDocument();
    });

    it("clicking Cancel resets the textarea and restores the default action buttons", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await openModal(user);
      await user.click(
        screen.getByRole("button", { name: /i want to adjust/i }),
      );
      await user.type(
        screen.getByPlaceholderText(/describe what you want to change or add/i),
        "draft",
      );

      await user.click(screen.getByRole("button", { name: /^cancel$/i }));

      expect(
        screen.queryByPlaceholderText(
          /describe what you want to change or add/i,
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /looks good, save/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /i want to adjust/i }),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: /i want to adjust/i }),
      );
      expect(
        screen.getByPlaceholderText(/describe what you want to change or add/i),
      ).toHaveValue("");
    });

    it("persists savedProfile state across modal close and reopen", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await openModal(user);
      await user.click(
        screen.getByRole("button", { name: /looks good, save/i }),
      );

      expect(
        screen.getByRole("heading", { name: /profile saved/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /go to job match/i }),
      ).toBeInTheDocument();

      await user.keyboard("{Escape}");
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200);
      });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: /confirm profile/i }),
      );
      await screen.findByRole("dialog");

      expect(
        screen.getByRole("heading", { name: /profile saved/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /go to job match/i }),
      ).toBeInTheDocument();
    });

    it("navigates to /job-match and closes the modal when Go to Job Match is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await openModal(user);
      await user.click(
        screen.getByRole("button", { name: /looks good, save/i }),
      );
      await user.click(
        screen.getByRole("button", { name: /go to job match/i }),
      );

      expect(mockNavigate).toHaveBeenCalledWith("/job-match");
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200);
      });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Adjust textarea counter", () => {
    it("shows 0 / 500 when the adjust panel opens", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await openModal(user);
      await user.click(
        screen.getByRole("button", { name: /i want to adjust/i }),
      );

      expect(screen.getByText("0 / 500")).toBeInTheDocument();
    });

    it("updates the counter as the user types", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await openModal(user);
      await user.click(
        screen.getByRole("button", { name: /i want to adjust/i }),
      );

      const textarea = screen.getByPlaceholderText(
        /describe what you want to change or add/i,
      );
      await user.type(textarea, "hello world");

      expect(screen.getByText("11 / 500")).toBeInTheDocument();
    });
  });

  describe("Re-evaluate flow", () => {
    it("updates the summary inside the modal and collapses the adjust panel after Re-evaluate completes", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await openModal(user);
      await user.click(
        screen.getByRole("button", { name: /i want to adjust/i }),
      );

      const textarea = screen.getByPlaceholderText(
        /describe what you want to change or add/i,
      );
      await user.type(textarea, "Add team collaboration context");
      await user.click(screen.getByRole("button", { name: /^re-evaluate$/i }));

      expect(screen.getByText(/re-evaluating/i)).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });

      expect(screen.getByText(/team collaboration/i)).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(
          /describe what you want to change or add/i,
        ),
      ).not.toBeInTheDocument();
    });
  });
});
