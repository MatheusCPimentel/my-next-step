import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { JobCard } from "@/pages/Board/components/JobCard";
import type { Job } from "@/pages/Board/types";

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: "job-1",
  company: "Acme",
  title: "Frontend Engineer",
  description: "",
  requiredSkills: [],
  niceToHaveSkills: [],
  columnId: "col-1",
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-01T00:00:00.000Z",
  stageHistory: [{ stage: "Applied", date: "2026-04-01T00:00:00.000Z" }],
  fromJobMatch: false,
  ...overrides,
});

function renderCard(job: Job, onClick?: () => void) {
  return render(
    <DndContext>
      <SortableContext items={[job.id]}>
        <JobCard job={job} onClick={onClick} />
      </SortableContext>
    </DndContext>,
  );
}

describe("JobCard", () => {
  it("renders the title and company", () => {
    renderCard(
      makeJob({ company: "Stripe", title: "Senior Frontend Engineer" }),
    );

    expect(screen.getByText("Stripe")).toBeInTheDocument();
    expect(screen.getByText("Senior Frontend Engineer")).toBeInTheDocument();
  });

  it("shows the fit score pill when fitScore is set", () => {
    renderCard(makeJob({ fitScore: 78 }));

    expect(screen.getByText("78% fit")).toBeInTheDocument();
    expect(screen.queryByText("Not analyzed")).not.toBeInTheDocument();
  });

  it("renders '0% fit' (not 'Not analyzed') when fitScore is exactly 0", () => {
    renderCard(makeJob({ fitScore: 0 }));

    expect(screen.getByText("0% fit")).toBeInTheDocument();
    expect(screen.queryByText("Not analyzed")).not.toBeInTheDocument();
  });

  it("shows the Not analyzed pill when fitScore is missing", () => {
    renderCard(makeJob({ fitScore: undefined }));

    expect(screen.getByText("Not analyzed")).toBeInTheDocument();
    expect(screen.queryByText(/% fit/)).not.toBeInTheDocument();
  });

  it("calls onClick when the card body is clicked", () => {
    const onClick = vi.fn();
    renderCard(makeJob(), onClick);

    fireEvent.click(screen.getByText("Acme"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a short month-day date derived from updatedAt", () => {
    renderCard(
      makeJob({
        updatedAt: "2026-04-15T12:00:00.000Z",
        // Override default stageHistory so the latest entry doesn't dominate.
        stageHistory: [{ stage: "Applied", date: "2026-04-15T12:00:00.000Z" }],
        createdAt: "2026-04-15T12:00:00.000Z",
      }),
    );

    expect(screen.getByText("Apr 15")).toBeInTheDocument();
  });

  it("falls back to createdAt when updatedAt is missing", () => {
    const job = makeJob({
      createdAt: "2026-03-08T12:00:00.000Z",
      stageHistory: [],
    });
    delete (job as Partial<Job>).updatedAt;

    renderCard(job);

    expect(screen.getByText("Mar 8")).toBeInTheDocument();
  });
});
