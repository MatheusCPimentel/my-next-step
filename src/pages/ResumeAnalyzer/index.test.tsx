import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
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

async function advanceToStep2(user: ReturnType<typeof userEvent.setup>) {
  selectFile(makePdf());
  await user.click(screen.getByRole("button", { name: /analyze resume/i }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2500);
  });
}

async function advanceToStep3(user: ReturnType<typeof userEvent.setup>) {
  await advanceToStep2(user);
  await user.click(screen.getByRole("button", { name: /save profile/i }));
}

describe("ResumeAnalyzer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockNavigate.mockClear();
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
        screen.getByRole("button", { name: /save profile/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/reading your resume/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Step 3 — Your profile", () => {
    it("advances from analysis to step 3 with the initial summary and both action buttons when Save profile is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderResumeAnalyzer();

      await advanceToStep3(user);

      expect(
        screen.getByRole("heading", { name: /^your profile$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /senior frontend engineer with 5 years of experience in react and typescript\. you have shipped/i,
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

      expect(
        screen.getByText(/with additional context in team collaboration/i),
      ).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(
          /describe what you want to change or add/i,
        ),
      ).not.toBeInTheDocument();
    });
  });
});
