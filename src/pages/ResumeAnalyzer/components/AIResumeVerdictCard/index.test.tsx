import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIResumeVerdictCard } from "@/pages/ResumeAnalyzer/components/AIResumeVerdictCard";

describe("AIResumeVerdictCard", () => {
  it("renders the AI Resume Verdict title", () => {
    render(<AIResumeVerdictCard verdict="Solid resume overall." />);

    expect(
      screen.getByRole("heading", { name: /ai resume verdict/i }),
    ).toBeInTheDocument();
  });

  it("renders the verdict text passed via props", () => {
    const verdict =
      "You have shipped production work and your skills are aligned to the role.";
    render(<AIResumeVerdictCard verdict={verdict} />);

    expect(screen.getByText(verdict)).toBeInTheDocument();
  });

  it("forwards className to the outermost wrapper", () => {
    render(
      <AIResumeVerdictCard
        verdict="Anything"
        className="md:col-span-2 custom-marker"
      />,
    );

    const heading = screen.getByRole("heading", {
      name: /ai resume verdict/i,
    });
    const wrapper = heading.closest(".custom-marker");
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass("md:col-span-2");
  });
});
