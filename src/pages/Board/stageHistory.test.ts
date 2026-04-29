import { describe, expect, it } from "vitest";
import {
  appendStageMove,
  applyCreateTimestamps,
  applyEditTimestamp,
} from "@/pages/Board/stageHistory";
import type { Job } from "@/pages/Board/types";

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: "job-1",
  company: "Acme",
  title: "Frontend Engineer",
  description: "",
  requiredSkills: [],
  niceToHaveSkills: [],
  columnId: "col-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  stageHistory: [{ stage: "Applied", date: "2026-01-01T00:00:00.000Z" }],
  ...overrides,
});

describe("appendStageMove", () => {
  it("appends a new stage entry, bumps updatedAt, and preserves other fields", () => {
    const job = makeJob({ company: "Globex" });
    const now = "2026-04-25T10:00:00.000Z";

    const result = appendStageMove(job, "Interview", now);

    expect(result.updatedAt).toBe(now);
    expect(result.stageHistory).toEqual([
      { stage: "Applied", date: "2026-01-01T00:00:00.000Z" },
      { stage: "Interview", date: now },
    ]);
    expect(result.company).toBe("Globex");
    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("does not mutate the original job", () => {
    const job = makeJob();
    const originalHistory = job.stageHistory;

    appendStageMove(job, "Offer", "2026-05-01T00:00:00.000Z");

    expect(job.stageHistory).toBe(originalHistory);
    expect(job.stageHistory).toHaveLength(1);
    expect(job.updatedAt).toBe("2026-01-01T00:00:00.000Z");
  });
});

describe("applyCreateTimestamps", () => {
  it("fills missing timestamps and seeds Applied stage history", () => {
    const job = makeJob({
      createdAt: "",
      updatedAt: "",
      stageHistory: [],
    });
    const now = "2026-04-25T10:00:00.000Z";

    const result = applyCreateTimestamps(job, now);

    expect(result.createdAt).toBe(now);
    expect(result.updatedAt).toBe(now);
    expect(result.stageHistory).toEqual([{ stage: "Applied", date: now }]);
  });

  it("preserves existing timestamps and stage history", () => {
    const job = makeJob({
      createdAt: "2025-12-01T00:00:00.000Z",
      updatedAt: "2026-01-15T00:00:00.000Z",
      stageHistory: [
        { stage: "Applied", date: "2025-12-01T00:00:00.000Z" },
        { stage: "Interview", date: "2026-01-15T00:00:00.000Z" },
      ],
    });
    const now = "2026-04-25T10:00:00.000Z";

    const result = applyCreateTimestamps(job, now);

    expect(result.createdAt).toBe("2025-12-01T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-01-15T00:00:00.000Z");
    expect(result.stageHistory).toEqual([
      { stage: "Applied", date: "2025-12-01T00:00:00.000Z" },
      { stage: "Interview", date: "2026-01-15T00:00:00.000Z" },
    ]);
  });
});

describe("applyEditTimestamp", () => {
  it("only bumps updatedAt and leaves createdAt and stageHistory unchanged", () => {
    const job = makeJob();
    const now = "2026-04-25T10:00:00.000Z";

    const result = applyEditTimestamp(job, now);

    expect(result.updatedAt).toBe(now);
    expect(result.createdAt).toBe(job.createdAt);
    expect(result.stageHistory).toEqual(job.stageHistory);
  });
});
