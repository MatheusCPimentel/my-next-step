import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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

function renderCard(job: Job) {
  return render(
    <DndContext>
      <SortableContext items={[job.id]}>
        <JobCard job={job} />
      </SortableContext>
    </DndContext>,
  );
}

describe("JobCard", () => {
  it("shows the AI analyzed pill when fromJobMatch is true", () => {
    renderCard(makeJob({ fromJobMatch: true }));

    expect(screen.getByText("AI analyzed")).toBeInTheDocument();
    expect(screen.queryByText("Not analyzed")).not.toBeInTheDocument();
  });

  it("shows the Not analyzed pill when fromJobMatch is false or undefined", () => {
    const { rerender } = renderCard(makeJob({ fromJobMatch: false }));
    expect(screen.getByText("Not analyzed")).toBeInTheDocument();
    expect(screen.queryByText("AI analyzed")).not.toBeInTheDocument();

    rerender(
      <DndContext>
        <SortableContext items={["job-1"]}>
          <JobCard job={makeJob({ fromJobMatch: undefined })} />
        </SortableContext>
      </DndContext>,
    );
    expect(screen.getByText("Not analyzed")).toBeInTheDocument();
    expect(screen.queryByText("AI analyzed")).not.toBeInTheDocument();
  });
});
