import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttentionPointsCard } from "@/pages/ResumeAnalyzer/components/AttentionPointsCard";

describe("AttentionPointsCard", () => {
  it("renders the Attention points title", () => {
    render(<AttentionPointsCard items={["Sparse education section"]} />);

    expect(
      screen.getByRole("heading", { name: /attention points/i }),
    ).toBeInTheDocument();
  });

  it("renders every item passed via props", () => {
    const items = [
      "Education section is sparse",
      "No mention of side projects",
      "Tooling list is broad",
    ];
    render(<AttentionPointsCard items={items} />);

    for (const item of items) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("renders the title without any list items when items is empty", () => {
    render(<AttentionPointsCard items={[]} />);

    expect(
      screen.getByRole("heading", { name: /attention points/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
