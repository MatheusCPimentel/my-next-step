import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIVerdictCard } from "@/components/AIVerdictCard";

describe("AIVerdictCard", () => {
  it("renders the title as a heading", () => {
    render(<AIVerdictCard title="AI Final Verdict" verdict="Worth applying." />);

    expect(
      screen.getByRole("heading", { name: /ai final verdict/i }),
    ).toBeInTheDocument();
  });

  it("renders the verdict paragraph text", () => {
    render(
      <AIVerdictCard
        title="AI Final Verdict"
        verdict="This role aligns well with your background."
      />,
    );

    expect(
      screen.getByText("This role aligns well with your background."),
    ).toBeInTheDocument();
  });

  it("renders the Sparkles icon", () => {
    const { container } = render(
      <AIVerdictCard title="AI Final Verdict" verdict="Worth applying." />,
    );

    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders the action slot when provided", () => {
    render(
      <AIVerdictCard
        title="Hero"
        verdict="Some verdict copy."
        action={<button type="button">Test action</button>}
      />,
    );
    expect(
      screen.getByRole("button", { name: /test action/i }),
    ).toBeInTheDocument();
  });
});
