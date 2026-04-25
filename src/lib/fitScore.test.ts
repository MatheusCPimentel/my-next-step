import { describe, it, expect } from "vitest";
import { fitScoreClasses } from "./fitScore";

describe("fitScoreClasses", () => {
  it("returns 'Not a fit' bucket for scores below 50", () => {
    expect(fitScoreClasses(0).label).toBe("Not a fit");
    expect(fitScoreClasses(49).label).toBe("Not a fit");
  });

  it("returns 'Borderline' bucket for scores in [50, 60)", () => {
    expect(fitScoreClasses(50).label).toBe("Borderline");
    expect(fitScoreClasses(59).label).toBe("Borderline");
  });

  it("returns 'Partial fit' bucket for scores in [60, 70)", () => {
    expect(fitScoreClasses(60).label).toBe("Partial fit");
    expect(fitScoreClasses(69).label).toBe("Partial fit");
  });

  it("returns 'Good fit' bucket for scores in [70, 80)", () => {
    expect(fitScoreClasses(70).label).toBe("Good fit");
    expect(fitScoreClasses(79).label).toBe("Good fit");
  });

  it("returns 'Excellent fit' bucket for scores at or above 80", () => {
    expect(fitScoreClasses(80).label).toBe("Excellent fit");
    expect(fitScoreClasses(100).label).toBe("Excellent fit");
  });

  it("uses red classes for 'Not a fit'", () => {
    const fit = fitScoreClasses(20);
    expect(fit.text).toBe("text-red-500");
    expect(fit.dot).toBe("bg-red-500");
    expect(fit.badge).toBe("bg-red-500/15 text-red-500");
    expect(fit.pillTint).toBe("bg-red-500/8 border-red-500/15 text-red-500");
    expect(fit.border).toBe("border-l-2 border-red-500");
  });

  it("uses orange classes with yellow border for 'Borderline'", () => {
    const fit = fitScoreClasses(55);
    expect(fit.text).toBe("text-orange-400");
    expect(fit.dot).toBe("bg-orange-400");
    expect(fit.badge).toBe("bg-orange-400/15 text-orange-400");
    expect(fit.pillTint).toBe(
      "bg-orange-400/8 border-orange-400/15 text-orange-400",
    );
    expect(fit.border).toBe("border-l-2 border-yellow-400");
  });

  it("uses yellow classes with teal border for 'Partial fit'", () => {
    const fit = fitScoreClasses(65);
    expect(fit.text).toBe("text-yellow-400");
    expect(fit.dot).toBe("bg-yellow-400");
    expect(fit.badge).toBe("bg-yellow-400/15 text-yellow-400");
    expect(fit.pillTint).toBe(
      "bg-yellow-400/8 border-yellow-400/15 text-yellow-400",
    );
    expect(fit.border).toBe("border-l-2 border-teal");
  });

  it("uses teal classes for 'Good fit'", () => {
    const fit = fitScoreClasses(78);
    expect(fit.text).toBe("text-teal");
    expect(fit.dot).toBe("bg-teal");
    expect(fit.badge).toBe("bg-teal/15 text-teal");
    expect(fit.pillTint).toBe("bg-teal/8 border-teal/15 text-teal");
    expect(fit.border).toBe("border-l-2 border-teal");
  });

  it("uses green classes with teal border for 'Excellent fit'", () => {
    const fit = fitScoreClasses(90);
    expect(fit.text).toBe("text-green-400");
    expect(fit.dot).toBe("bg-green-400");
    expect(fit.badge).toBe("bg-green-400/15 text-green-400");
    expect(fit.pillTint).toBe(
      "bg-green-400/8 border-green-400/15 text-green-400",
    );
    expect(fit.border).toBe("border-l-2 border-teal");
  });
});
