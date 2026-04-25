import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobDialog } from "@/components/JobDialog";
import type { Job } from "@/pages/Board/types";

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
    it("renders no inputs or textareas when mode is view", () => {
      const job = makeJob();
      render(<Harness mode="view" job={job} />);

      expect(document.querySelectorAll("input")).toHaveLength(0);
      expect(document.querySelectorAll("textarea")).toHaveLength(0);
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
  });

  describe("edit mode display via Edit button", () => {
    it("reveals input and textarea elements after clicking Edit", async () => {
      const user = userEvent.setup();
      render(<Harness mode="view" job={makeJob()} />);

      expect(document.querySelectorAll("input")).toHaveLength(0);
      expect(document.querySelectorAll("textarea")).toHaveLength(0);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      expect(document.querySelectorAll("input").length).toBeGreaterThan(0);
      expect(document.querySelectorAll("textarea").length).toBeGreaterThan(0);
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

      const ref: { setOpen: ((open: boolean) => void) | null } = {
        setOpen: null,
      };
      const onOpenChange = vi.fn();
      const job = makeJob({
        title: "Original Title",
        description: "Original description",
      });

      function Wrapper() {
        const [open, setOpen] = useState(true);
        ref.setOpen = setOpen;
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

});
