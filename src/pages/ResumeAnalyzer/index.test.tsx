import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

async function advanceToStep2(user: ReturnType<typeof userEvent.setup>) {
  selectFile(makePdf());
  await user.click(screen.getByRole("button", { name: /analyze resume/i }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2500);
  });
}

async function advanceToStep3(user: ReturnType<typeof userEvent.setup>) {
  await advanceToStep2(user);
  await user.click(screen.getByRole("button", { name: /review your profile/i }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60);
  });
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: /^your profile$/i }),
    ).toBeInTheDocument(),
  );
}

describe("ResumeAnalyzer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockNavigate.mockClear();
    Element.prototype.scrollIntoView = vi.fn();
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Step 1 — Upload", () => {
    it("renders the stepper labels, page title, upload copy and the right column title", () => {
      renderResumeAnalyzer();

      expect(screen.getByText("Upload")).toBeInTheDocument();
      expect(screen.getByText("Analysis")).toBeInTheDocument();
      expect(screen.getAllByText("Your profile").length).toBeGreaterThan(0);
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

    it("advances to step 2 after 2.5 seconds with the analysis content", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      selectFile(makePdf());
      await user.click(screen.getByRole("button", { name: /analyze resume/i }));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2500);
      });

      expect(screen.getByText(/analysis complete/i)).toBeInTheDocument();
      expect(screen.getByText(/here's what we found/i)).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /^summary$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /^strengths$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /^weaknesses$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /attention points/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /ats score/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /^suggestions$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /review your profile/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/reading your resume/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Step 3 — Your profile", () => {
    it("keeps the analysis cards visible and reveals the profile section when Review your profile is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);

      expect(
        screen.getByRole("heading", { name: /^summary$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /^strengths$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /^weaknesses$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /attention points/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /ats score/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /^suggestions$/i }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("heading", { name: /^your profile$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /senior frontend engineer with 5 years of experience in react and typescript\. you have shipped/i,
        ),
      ).toBeInTheDocument();
    });

    it("shows the AI-understood subtitle inside the expanded section and the two action buttons", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);

      expect(
        screen.getByText(
          /this is what the ai understood about you\. confirm or adjust before saving/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /looks good, save/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /i want to adjust/i }),
      ).toBeInTheDocument();
    });

    it("shows the success state with a Go to Job Match button after Looks good, save", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);
      await user.click(screen.getByRole("button", { name: /looks good, save/i }));

      expect(
        screen.getByRole("heading", { name: /profile saved/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /go to job match/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /looks good, save/i }),
      ).not.toBeInTheDocument();
    });

    it("navigates to /job-match when Go to Job Match is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);
      await user.click(screen.getByRole("button", { name: /looks good, save/i }));
      await user.click(screen.getByRole("button", { name: /go to job match/i }));

      expect(mockNavigate).toHaveBeenCalledWith("/job-match");
    });

    it("reveals the textarea and Re-evaluate button when 'I want to adjust' is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);
      await user.click(screen.getByRole("button", { name: /i want to adjust/i }));

      expect(
        screen.getByPlaceholderText(
          /describe what you want to change or add/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^re-evaluate$/i }),
      ).toBeInTheDocument();
    });

    it("updates the summary and closes the adjust panel after Re-evaluate completes", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);
      await user.click(screen.getByRole("button", { name: /i want to adjust/i }));

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

  describe("Step 3 right column", () => {
    it("renders the Why this matters card on initial step 3", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);

      expect(
        screen.getByRole("heading", { name: /why this matters/i }),
      ).toBeInTheDocument();
    });

    it("keeps the Why this matters card visible after saving the profile", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);
      await user.click(screen.getByRole("button", { name: /looks good, save/i }));

      expect(
        screen.getByRole("heading", { name: /why this matters/i }),
      ).toBeInTheDocument();
    });

    it("renders the three Why this matters bullets", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);

      expect(
        screen.getByText(/this profile is used by job match/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/the more accurate it is, the better your match scores/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/you can always come back and update it later/i),
      ).toBeInTheDocument();
    });
  });

  describe("Adjust textarea counter", () => {
    it("shows 0 / 500 when the adjust panel opens", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);
      await user.click(screen.getByRole("button", { name: /i want to adjust/i }));

      expect(screen.getByText("0 / 500")).toBeInTheDocument();
    });

    it("updates the counter as the user types", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);
      await user.click(screen.getByRole("button", { name: /i want to adjust/i }));

      const textarea = screen.getByPlaceholderText(
        /describe what you want to change or add/i,
      );
      await user.type(textarea, "hello world");

      expect(screen.getByText("11 / 500")).toBeInTheDocument();
    });
  });

  describe("Stepper navigation", () => {
    it("returns to step 1 with the file preserved when the Upload step circle is clicked from step 2", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      selectFile(makePdf("my-cv.pdf"));
      await user.click(screen.getByRole("button", { name: /analyze resume/i }));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2500);
      });

      expect(
        screen.getByRole("button", { name: /review your profile/i }),
      ).toBeInTheDocument();

      const uploadCircle = screen.getByText("Upload")
        .previousElementSibling as HTMLElement;
      await user.click(uploadCircle);

      expect(
        screen.getByRole("button", { name: /analyze resume/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("my-cv.pdf")).toBeInTheDocument();
    });
  });

  describe("Profile section toggle", () => {
    it("hides the profile section by default after analysis completes", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep2(user);

      expect(
        screen.getByRole("button", { name: /review your profile/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /back to analysis/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /^your profile$/i }),
      ).not.toBeInTheDocument();
    });

    it("toggles the profile section when the floating button is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);

      expect(
        screen.getByRole("heading", { name: /^your profile$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /back to analysis/i }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /back to analysis/i }));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /review your profile/i }),
        ).toBeInTheDocument(),
      );
      expect(
        screen.queryByRole("button", { name: /back to analysis/i }),
      ).not.toBeInTheDocument();
    });

    it("scrolls the profile section into view when expanding", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep2(user);
      await user.click(screen.getByRole("button", { name: /review your profile/i }));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60);
      });

      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
    });

    it("scrolls to top when collapsing via the floating button", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);
      (window.scrollTo as ReturnType<typeof vi.fn>).mockClear();

      await user.click(screen.getByRole("button", { name: /back to analysis/i }));

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: "smooth",
      });
    });

    it("collapses the profile section and scrolls to top when the Analysis stepper circle is clicked from step 3", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);
      (window.scrollTo as ReturnType<typeof vi.fn>).mockClear();

      const analysisCircle = screen.getByText("Analysis")
        .previousElementSibling as HTMLElement;
      await user.click(analysisCircle);

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: "smooth",
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /review your profile/i }),
        ).toBeInTheDocument(),
      );
    });
  });
});
