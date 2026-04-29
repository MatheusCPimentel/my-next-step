import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeaknessesCard } from "@/pages/ResumeAnalyzer/components/WeaknessesCard";

describe("WeaknessesCard", () => {
  it("renders every item passed via props", () => {
    const items = [
      "No professional summary at the top",
      "Some role descriptions are too brief",
      "Missing leadership context",
    ];
    render(<WeaknessesCard items={items} />);

    for (const item of items) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("renders the title without any list items when items is empty", () => {
    render(<WeaknessesCard items={[]} />);

    expect(
      screen.getByRole("heading", { name: /^weaknesses$/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
