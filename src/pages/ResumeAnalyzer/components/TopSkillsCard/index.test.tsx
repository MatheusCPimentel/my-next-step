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

  it("sets each progress bar width to match the skill level", () => {
    render(
      <TopSkillsCard
        skills={[
          { name: "Alpha", level: 25 },
          { name: "Beta", level: 75 },
        ]}
      />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);

    const alphaBar = items[0].querySelector("span > span") as HTMLElement;
    const betaBar = items[1].querySelector("span > span") as HTMLElement;

    expect(alphaBar.style.width).toBe("25%");
    expect(betaBar.style.width).toBe("75%");
  });

  it("renders the title without any list items when skills is empty", () => {
    render(<TopSkillsCard skills={[]} />);

    expect(
      screen.getByRole("heading", { name: /top skills/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
