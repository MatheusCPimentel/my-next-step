import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StrengthsCard } from "@/pages/ResumeAnalyzer/components/StrengthsCard";

describe("StrengthsCard", () => {
  it("renders the Strengths title", () => {
    render(<StrengthsCard items={["Strong React skills"]} />);

    expect(
      screen.getByRole("heading", { name: /^strengths$/i }),
    ).toBeInTheDocument();
  });

  it("renders every item passed via props", () => {
    const items = [
      "Strong technical skills",
      "Quantified achievements",
      "Clear career progression",
    ];
    render(<StrengthsCard items={items} />);

    for (const item of items) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("renders the title without any list items when items is empty", () => {
    render(<StrengthsCard items={[]} />);

    expect(
      screen.getByRole("heading", { name: /^strengths$/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
