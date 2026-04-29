import { describe, it, expect } from "vitest";
import { fitScoreClasses } from "./fitScore";

describe("fitScoreClasses", () => {
  it.each<[number, string]>([
    [0, "Not a fit"],
    [30, "Not a fit"],
    [49, "Not a fit"],
    [50, "Borderline"],
    [55, "Borderline"],
    [59, "Borderline"],
    [60, "Partial fit"],
    [65, "Partial fit"],
    [69, "Partial fit"],
    [70, "Good fit"],
    [75, "Good fit"],
    [79, "Good fit"],
    [80, "Excellent fit"],
    [92, "Excellent fit"],
    [100, "Excellent fit"],
  ])("score %i returns label '%s'", (score, label) => {
    expect(fitScoreClasses(score).label).toBe(label);
  });
});
