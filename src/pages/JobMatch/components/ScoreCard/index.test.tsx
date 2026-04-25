import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreCard } from "@/pages/JobMatch/components/ScoreCard";

interface ScoreCardProps {
  opportunityScore: number;
  fitScore: number;
  environmentScore: number | null | undefined;
  opportunityDescription: string;
  finalVerdict: string;
}

const makeProps = (overrides: Partial<ScoreCardProps> = {}): ScoreCardProps => ({
  opportunityScore: 72,
  fitScore: 78,
  environmentScore: 65,
  opportunityDescription: "Solid fit.",
  finalVerdict: "Worth applying.",
  ...overrides,
});

describe("ScoreCard", () => {
  it("renders the opportunity score number and the / 100 label", () => {
    render(<ScoreCard {...makeProps()} />);

    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("/ 100")).toBeInTheDocument();
  });

  it("renders both fit and environment rows when environmentScore is a number", () => {
    render(<ScoreCard {...makeProps()} />);

    expect(screen.getByText("Fit score")).toBeInTheDocument();
    expect(screen.getByText("Environment")).toBeInTheDocument();
    expect(screen.getByText("65")).toBeInTheDocument();
  });

  it("hides the environment row when environmentScore is null", () => {
    render(<ScoreCard {...makeProps({ environmentScore: null })} />);

    expect(screen.queryByText("Environment")).not.toBeInTheDocument();
    expect(screen.getByText("Fit score")).toBeInTheDocument();
  });

  it("hides the environment row when environmentScore is undefined", () => {
    render(<ScoreCard {...makeProps({ environmentScore: undefined })} />);

    expect(screen.queryByText("Environment")).not.toBeInTheDocument();
    expect(screen.getByText("Fit score")).toBeInTheDocument();
  });

  it("renders the final verdict text and label inside the card", () => {
    render(<ScoreCard {...makeProps({ finalVerdict: "Worth applying." })} />);

    expect(screen.getByText(/final verdict/i)).toBeInTheDocument();
    expect(screen.getByText(/worth applying\./i)).toBeInTheDocument();
  });

  it("renders the actions slot when provided", () => {
    render(
      <ScoreCard
        {...makeProps()}
        actions={<button type="button">Action button</button>}
      />,
    );

    expect(screen.getByRole("button", { name: /action button/i })).toBeInTheDocument();
  });

  it("shows 'Good opportunity' for scores in [70, 80)", () => {
    render(<ScoreCard {...makeProps({ opportunityScore: 72 })} />);

    expect(screen.getByText("Good opportunity")).toBeInTheDocument();
  });

  it("shows 'Not worth applying' for scores below 50", () => {
    render(<ScoreCard {...makeProps({ opportunityScore: 30 })} />);

    expect(screen.getByText("Not worth applying")).toBeInTheDocument();
  });

  it("shows 'Borderline' for scores in [50, 60)", () => {
    render(<ScoreCard {...makeProps({ opportunityScore: 55 })} />);

    expect(screen.getByText("Borderline")).toBeInTheDocument();
  });

  it("shows 'Partial opportunity' for scores in [60, 70)", () => {
    render(<ScoreCard {...makeProps({ opportunityScore: 65 })} />);

    expect(screen.getByText("Partial opportunity")).toBeInTheDocument();
  });

  it("shows 'Excellent opportunity' for scores at or above 80", () => {
    render(<ScoreCard {...makeProps({ opportunityScore: 92 })} />);

    expect(screen.getByText("Excellent opportunity")).toBeInTheDocument();
  });
});
