import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopSkillsCard } from "@/pages/ResumeAnalyzer/components/TopSkillsCard";

const makeSkills = () => [
  { name: "React", level: 92 },
  { name: "TypeScript", level: 88 },
  { name: "System design", level: 48 },
];

describe("TopSkillsCard", () => {
  it("renders the Top skills title", () => {
    render(<TopSkillsCard skills={makeSkills()} />);

    expect(
      screen.getByRole("heading", { name: /top skills/i }),
    ).toBeInTheDocument();
  });

  it("renders every skill name and its percentage label", () => {
    render(<TopSkillsCard skills={makeSkills()} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();
    expect(screen.getByText("System design")).toBeInTheDocument();
    expect(screen.getByText("48%")).toBeInTheDocument();
  });

  it("renders boundary levels of 0% and 100%", () => {
    render(
      <TopSkillsCard
        skills={[
          { name: "Empty skill", level: 0 },
          { name: "Mastered skill", level: 100 },
        ]}
      />,
    );

    expect(screen.getByText("Empty skill")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("Mastered skill")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders the title without any list items when skills is empty", () => {
    render(<TopSkillsCard skills={[]} />);

    expect(
      screen.getByRole("heading", { name: /top skills/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
