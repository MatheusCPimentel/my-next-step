import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreCard } from "@/pages/JobMatch/components/ScoreCard";

interface ScoreCardProps {
  opportunityScore: number;
  fitScore: number;
  environmentScore: number | null | undefined;
  opportunityDescription: string;
  environmentSignals?: Array<{
    type: "positive" | "warning" | "negative";
    text: string;
  }>;
}

const makeProps = (overrides: Partial<ScoreCardProps> = {}): ScoreCardProps => ({
  opportunityScore: 72,
  fitScore: 78,
  environmentScore: 65,
  opportunityDescription: "Solid fit.",
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

  it("renders the environment signals block when provided", () => {
    render(
      <ScoreCard
        {...makeProps({
          environmentSignals: [{ type: "positive", text: "Remote-first" }],
        })}
      />,
    );
    expect(screen.getByText("Environment assessment")).toBeInTheDocument();
    expect(screen.getByText("Remote-first")).toBeInTheDocument();
  });

  it("omits the environment block when environmentSignals is undefined", () => {
    render(<ScoreCard {...makeProps()} />);
    expect(
      screen.queryByText("Environment assessment"),
    ).not.toBeInTheDocument();
  });

  it("omits the environment block when environmentSignals is empty", () => {
    render(<ScoreCard {...makeProps({ environmentSignals: [] })} />);
    expect(
      screen.queryByText("Environment assessment"),
    ).not.toBeInTheDocument();
  });

  it.each<[number, string]>([
    [0, "Not worth applying"],
    [49, "Not worth applying"],
    [50, "Borderline"],
    [55, "Borderline"],
    [59, "Borderline"],
    [60, "Partial opportunity"],
    [65, "Partial opportunity"],
    [69, "Partial opportunity"],
    [70, "Good opportunity"],
    [72, "Good opportunity"],
    [79, "Good opportunity"],
    [80, "Excellent opportunity"],
    [92, "Excellent opportunity"],
    [100, "Excellent opportunity"],
  ])("opportunityScore %i shows label '%s'", (score, label) => {
    render(<ScoreCard {...makeProps({ opportunityScore: score })} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  describe("environment signals by type", () => {
    it("renders warning signals", () => {
      render(
        <ScoreCard
          {...makeProps({
            environmentSignals: [
              { type: "warning", text: "On-call rotation is heavy" },
            ],
          })}
        />,
      );

      expect(screen.getByText("On-call rotation is heavy")).toBeInTheDocument();
    });

    it("renders negative signals", () => {
      render(
        <ScoreCard
          {...makeProps({
            environmentSignals: [
              { type: "negative", text: "Reports of toxic culture" },
            ],
          })}
        />,
      );

      expect(
        screen.getByText("Reports of toxic culture"),
      ).toBeInTheDocument();
    });
  });
});
