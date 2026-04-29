import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ATSScoreCard } from "@/pages/ResumeAnalyzer/components/ATSScoreCard";

describe("ATSScoreCard", () => {
  it("renders the score, label, and description", () => {
    render(
      <ATSScoreCard
        score={72}
        label="Good"
        description="Your resume is readable by most ATS systems."
      />,
    );

    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(
      screen.getByText("Your resume is readable by most ATS systems."),
    ).toBeInTheDocument();
  });

  it("renders the ATS score title", () => {
    render(<ATSScoreCard score={50} label="Average" description="text" />);

    expect(
      screen.getByRole("heading", { name: /ats score/i }),
    ).toBeInTheDocument();
  });

  it("renders a score of 0 (does not collapse to empty)", () => {
    render(<ATSScoreCard score={0} label="Poor" description="Not readable." />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Poor")).toBeInTheDocument();
    expect(screen.getByText("Not readable.")).toBeInTheDocument();
  });
});
