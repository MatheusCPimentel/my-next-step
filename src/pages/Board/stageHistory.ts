import type { Job } from "@/pages/Board/types";

export function appendStageMove(job: Job, stage: string, now: string): Job {
  return {
    ...job,
    updatedAt: now,
    stageHistory: [...job.stageHistory, { stage, date: now }],
  };
}

export function applyCreateTimestamps(job: Job, now: string): Job {
  const createdAt = job.createdAt || now;
  const updatedAt = job.updatedAt || now;
  const stageHistory =
    job.stageHistory && job.stageHistory.length > 0
      ? job.stageHistory
      : [{ stage: "Applied", date: now }];
  return { ...job, createdAt, updatedAt, stageHistory };
}

export function applyEditTimestamp(job: Job, now: string): Job {
  return { ...job, updatedAt: now };
}
