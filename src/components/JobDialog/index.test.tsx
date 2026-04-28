import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useState } from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobDialog } from "@/components/JobDialog";
import type { Job } from "@/pages/Board/types";

type MatchMediaFn = (query: string) => MediaQueryList;
const ORIGINAL_MATCH_MEDIA = window.matchMedia as MatchMediaFn | undefined;

function setMatchMediaDesktop() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) =>
      ({
        matches: true,
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

function restoreMatchMedia() {
  if (ORIGINAL_MATCH_MEDIA) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: ORIGINAL_MATCH_MEDIA,
    });
  } else {
    Reflect.deleteProperty(window, "matchMedia");
  }
}

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: "job-1",
  company: "Acme",
  title: "Senior Engineer",
  description: "Build great products.",
  requiredSkills: [{ name: "React", variant: "neutral" }],
  niceToHaveSkills: [{ name: "GraphQL", variant: "neutral" }],
  matchVerdict: "Strong match",
  contractType: "Full-time",
  salary: "$150k",
  benefits: "Health, PTO",
  jobUrl: "https://example.com/job",
  notes: "Recruiter is friendly",
  columnId: "applied",
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-01T00:00:00.000Z",
  stageHistory: [{ stage: "Applied", date: "2026-04-01T00:00:00.000Z" }],
  ...overrides,
});

interface HarnessProps {
  initialOpen?: boolean;
  mode: "create" | "view" | "edit";
  job?: Job;
  columnId?: string;
  onSubmit?: (job: Job) => void;
}

function Harness({
  initialOpen = true,
  mode,
  job,
  columnId,
  onSubmit = vi.fn(),
}: HarnessProps) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        external-open
      </button>
      <button type="button" onClick={() => setOpen(false)}>
        external-close
      </button>
      <JobDialog
        mode={mode}
        job={job}
        columnId={columnId}
        open={open}
        onOpenChange={setOpen}
        onSubmit={onSubmit}
      />
    </>
  );
}

describe("JobDialog", () => {
  describe("create mode validation", () => {
    it("shows 'Title is required' and does not call onSubmit when title is empty", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<Harness mode="create" columnId="applied" onSubmit={onSubmit} />);

      await user.type(screen.getByPlaceholderText("Company name"), "Acme");
      await user.type(
        screen.getByPlaceholderText("What is the role about?"),
        "A description",
      );
      const skillInputs = screen.getAllByPlaceholderText("Add a skill");
      await user.type(skillInputs[0], "React{Enter}");

      await user.click(screen.getByRole("button", { name: /^save$/i }));

      expect(await screen.findByText("Title is required")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("shows 'Description is required' when description is empty", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<Harness mode="create" columnId="applied" onSubmit={onSubmit} />);

      await user.type(screen.getByPlaceholderText("Company name"), "Acme");
      await user.type(
        screen.getByPlaceholderText("Job title"),
        "Senior Engineer",
      );
      const skillInputs = screen.getAllByPlaceholderText("Add a skill");
      await user.type(skillInputs[0], "React{Enter}");

      await user.click(screen.getByRole("button", { name: /^save$/i }));

      expect(
        await screen.findByText("Description is required"),
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("shows 'Add at least one required skill' when requiredSkills is empty", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<Harness mode="create" columnId="applied" onSubmit={onSubmit} />);

      await user.type(screen.getByPlaceholderText("Company name"), "Acme");
      await user.type(
        screen.getByPlaceholderText("Job title"),
        "Senior Engineer",
      );
      await user.type(
        screen.getByPlaceholderText("What is the role about?"),
        "A description",
      );

      await user.click(screen.getByRole("button", { name: /^save$/i }));

      expect(
        await screen.findByText("Add at least one required skill"),
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("calls onSubmit with an assembled Job (new id, columnId from prop, populated fields) when all required fields are filled", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<Harness mode="create" columnId="phone" onSubmit={onSubmit} />);

      await user.type(screen.getByPlaceholderText("Company name"), "Acme");
      await user.type(
        screen.getByPlaceholderText("Job title"),
        "Senior Engineer",
      );
      await user.type(
        screen.getByPlaceholderText("What is the role about?"),
        "Build great products",
      );
      const skillInputs = screen.getAllByPlaceholderText("Add a skill");
      await user.type(skillInputs[0], "React{Enter}");

      await user.click(screen.getByRole("button", { name: /^save$/i }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submitted = onSubmit.mock.calls[0][0] as Job;
      expect(submitted.company).toBe("Acme");
      expect(submitted.title).toBe("Senior Engineer");
      expect(submitted.description).toBe("Build great products");
      expect(submitted.requiredSkills).toEqual([
        { name: "React", variant: "neutral" },
      ]);
      expect(submitted.columnId).toBe("phone");
      expect(submitted.id).toEqual(expect.any(String));
      expect(submitted.id.length).toBeGreaterThan(0);
    });
  });

  describe("view mode display", () => {
    it("does not render the editable form fields when mode is view", () => {
      const job = makeJob();
      render(<Harness mode="view" job={job} />);

      expect(screen.queryByPlaceholderText("Company name")).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText("Job title")).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("What is the role about?"),
      ).not.toBeInTheDocument();
    });

    it("renders the job's title and description as text", () => {
      const job = makeJob({
        title: "Tech Lead",
        description: "Lead the platform team.",
      });
      render(<Harness mode="view" job={job} />);

      expect(screen.getByText("Tech Lead")).toBeInTheDocument();
      expect(screen.getByText("Lead the platform team.")).toBeInTheDocument();
    });

    it("shows an Edit button and no Save/Cancel buttons in the footer", () => {
      render(<Harness mode="view" job={makeJob()} />);

      expect(screen.getByRole("button", { name: /^edit$/i })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /^save$/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /^cancel$/i }),
      ).not.toBeInTheDocument();
    });

    it("renders an em-dash placeholder for missing optional fields in view mode", () => {
      const job = makeJob({
        matchVerdict: undefined,
        contractType: undefined,
        salary: undefined,
        benefits: undefined,
        jobUrl: undefined,
        notes: undefined,
        niceToHaveSkills: [],
      });
      render(<Harness mode="view" job={job} />);

      expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("stage history in view mode", () => {
    it("renders each stage history entry with its label", () => {
      const job = makeJob({
        stageHistory: [
          { stage: "Applied", date: "2026-04-01T10:00:00.000Z" },
          { stage: "HR Interview", date: "2026-04-15T14:00:00.000Z" },
          { stage: "Tech Interview", date: "2026-04-22T09:00:00.000Z" },
        ],
      });
      render(<Harness mode="view" job={job} />);

      expect(screen.getByText(/^history$/i)).toBeInTheDocument();
      expect(screen.getByText("Applied")).toBeInTheDocument();
      expect(screen.getByText("HR Interview")).toBeInTheDocument();
      expect(screen.getByText("Tech Interview")).toBeInTheDocument();
    });

    it("does not render the History section when stageHistory is empty", () => {
      const job = makeJob({ stageHistory: [] });
      render(<Harness mode="view" job={job} />);

      expect(screen.queryByText(/^history$/i)).not.toBeInTheDocument();
    });

    it("does not render the History section in edit mode", async () => {
      const user = userEvent.setup();
      const job = makeJob({
        stageHistory: [
          { stage: "Applied", date: "2026-04-01T10:00:00.000Z" },
        ],
      });
      render(<Harness mode="view" job={job} />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      expect(screen.queryByText(/^history$/i)).not.toBeInTheDocument();
    });
  });

  describe("edit mode display via Edit button", () => {
    it("reveals the editable form fields after clicking Edit", async () => {
      const user = userEvent.setup();
      render(<Harness mode="view" job={makeJob()} />);

      expect(screen.queryByPlaceholderText("Company name")).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText("Job title")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      expect(screen.getByPlaceholderText("Company name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Job title")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("What is the role about?"),
      ).toBeInTheDocument();
    });

    it("shows Cancel and Save in the footer (no Edit) after clicking Edit", async () => {
      const user = userEvent.setup();
      render(<Harness mode="view" job={makeJob()} />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      expect(
        screen.getByRole("button", { name: /^cancel$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^save$/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /^edit$/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("cancel in edit reverts to view", () => {
    it("keeps the dialog open, returns to view, and discards edits when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      const onOpenChange = vi.fn();
      const job = makeJob({
        title: "Original Title",
        description: "Original description",
      });

      function Wrapper() {
        const [open, setOpen] = useState(true);
        return (
          <JobDialog
            mode="view"
            job={job}
            open={open}
            onOpenChange={(next) => {
              onOpenChange(next);
              setOpen(next);
            }}
            onSubmit={onSubmit}
          />
        );
      }

      render(<Wrapper />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      const titleInput = screen.getByPlaceholderText(
        "Job title",
      ) as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, "Edited Title");
      expect(titleInput.value).toBe("Edited Title");

      await user.click(screen.getByRole("button", { name: /^cancel$/i }));

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: /^edit$/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("Original Title")).toBeInTheDocument();
      expect(screen.queryByText("Edited Title")).not.toBeInTheDocument();
    });
  });

  describe("state reset on close + reopen", () => {
    it("clears the title input when the parent closes and reopens in create mode", async () => {
      const user = userEvent.setup();
      render(<Harness mode="create" columnId="applied" />);

      const titleInput = screen.getByPlaceholderText(
        "Job title",
      ) as HTMLInputElement;
      await user.type(titleInput, "Leftover title");
      expect(titleInput.value).toBe("Leftover title");

      await act(async () => {
        screen.getByText("external-close").click();
      });
      await act(async () => {
        screen.getByText("external-open").click();
      });

      const reopenedTitle = screen.getByPlaceholderText(
        "Job title",
      ) as HTMLInputElement;
      expect(reopenedTitle.value).toBe("");
    });
  });

  describe("save in edit", () => {
    it("calls onSubmit with the merged job and closes the dialog", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const onOpenChange = vi.fn();
      const job = makeJob({
        id: "job-42",
        title: "Original Title",
        columnId: "phone",
      });

      render(
        <JobDialog
          mode="view"
          job={job}
          open
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />,
      );

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      const titleInput = screen.getByPlaceholderText(
        "Job title",
      ) as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Title");

      await user.click(screen.getByRole("button", { name: /^save$/i }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submitted = onSubmit.mock.calls[0][0] as Job;
      expect(submitted.id).toBe("job-42");
      expect(submitted.columnId).toBe("phone");
      expect(submitted.title).toBe("Updated Title");
      expect(submitted.description).toBe(job.description);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("company validation", () => {
    it("shows 'Company is required' and does not call onSubmit when company is empty", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<Harness mode="create" columnId="applied" onSubmit={onSubmit} />);

      await user.type(
        screen.getByPlaceholderText("Job title"),
        "Senior Engineer",
      );
      await user.type(
        screen.getByPlaceholderText("What is the role about?"),
        "A description",
      );
      const skillInputs = screen.getAllByPlaceholderText("Add a skill");
      await user.type(skillInputs[0], "React{Enter}");

      await user.click(screen.getByRole("button", { name: /^save$/i }));

      expect(await screen.findByText("Company is required")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("includes the typed company in the submitted Job when all required fields are filled", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<Harness mode="create" columnId="applied" onSubmit={onSubmit} />);

      await user.type(screen.getByPlaceholderText("Company name"), "Stripe");
      await user.type(
        screen.getByPlaceholderText("Job title"),
        "Senior Engineer",
      );
      await user.type(
        screen.getByPlaceholderText("What is the role about?"),
        "Build great products",
      );
      const skillInputs = screen.getAllByPlaceholderText("Add a skill");
      await user.type(skillInputs[0], "React{Enter}");

      await user.click(screen.getByRole("button", { name: /^save$/i }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submitted = onSubmit.mock.calls[0][0] as Job;
      expect(submitted.company).toBe("Stripe");
    });
  });

  describe("history date editing wiring", () => {
    beforeEach(() => {
      setMatchMediaDesktop();
    });

    afterEach(() => {
      restoreMatchMedia();
    });

    it("calls onJobUpdate with a job whose stageHistory entry is updated to the picked ISO date", async () => {
      const user = userEvent.setup();
      const onJobUpdate = vi.fn();
      const job = makeJob({
        stageHistory: [
          { stage: "Applied", date: "2026-04-15T12:00:00.000Z" },
        ],
      });

      render(
        <JobDialog
          mode="view"
          job={job}
          open
          onOpenChange={() => {}}
          onSubmit={() => {}}
          onJobUpdate={onJobUpdate}
        />,
      );

      await user.click(screen.getByRole("button", { name: /edit date/i }));
      const grid = await screen.findByRole("grid");
      await user.click(
        within(grid).getByRole("button", { name: /April 20th, 2026/ }),
      );

      expect(onJobUpdate).toHaveBeenCalledTimes(1);
      const updated = onJobUpdate.mock.calls[0][0] as Job;
      expect(updated.id).toBe(job.id);
      expect(updated.stageHistory).toHaveLength(1);
      expect(updated.stageHistory[0].stage).toBe("Applied");
      expect(updated.stageHistory[0].date).toMatch(
        /^2026-04-20T12:00:00\.000Z$/,
      );
    });

    it("renders history entries sorted ascending by date and updates the original stored index when the first row is edited", async () => {
      const user = userEvent.setup();
      const onJobUpdate = vi.fn();
      // Stored order is reversed: later date first, earlier date second.
      const job = makeJob({
        stageHistory: [
          { stage: "HR Interview", date: "2026-04-25T12:00:00.000Z" },
          { stage: "Applied", date: "2026-04-10T12:00:00.000Z" },
        ],
      });

      render(
        <JobDialog
          mode="view"
          job={job}
          open
          onOpenChange={() => {}}
          onSubmit={() => {}}
          onJobUpdate={onJobUpdate}
        />,
      );

      // The History list should render the earlier date first.
      const stageLabels = screen.getAllByText(/^(Applied|HR Interview)$/);
      expect(stageLabels[0]).toHaveTextContent("Applied");
      expect(stageLabels[1]).toHaveTextContent("HR Interview");

      // Clicking the first row's pencil targets "Applied" (stored index 1).
      const editButtons = screen.getAllByRole("button", {
        name: /edit date/i,
      });
      await user.click(editButtons[0]);

      const grid = await screen.findByRole("grid");
      await user.click(
        within(grid).getByRole("button", { name: /April 12th, 2026/ }),
      );

      expect(onJobUpdate).toHaveBeenCalledTimes(1);
      const updated = onJobUpdate.mock.calls[0][0] as Job;
      // Stored index 1 (Applied) should be the one updated.
      expect(updated.stageHistory[1].stage).toBe("Applied");
      expect(updated.stageHistory[1].date).toBe("2026-04-12T12:00:00.000Z");
      // Stored index 0 (HR Interview) is unchanged.
      expect(updated.stageHistory[0].stage).toBe("HR Interview");
      expect(updated.stageHistory[0].date).toBe("2026-04-25T12:00:00.000Z");
    });
  });
});
