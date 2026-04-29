import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SuggestionsCard } from "@/pages/ResumeAnalyzer/components/SuggestionsCard";

describe("SuggestionsCard", () => {
  it("renders every item passed via props", () => {
    const items = [
      "Add a 2–3 sentence professional summary",
      "Expand role descriptions with metrics",
      "Mention open-source contributions",
    ];
    render(<SuggestionsCard items={items} />);

    for (const item of items) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("renders the title without any list items when items is empty", () => {
    render(<SuggestionsCard items={[]} />);

    expect(
      screen.getByRole("heading", { name: /^suggestions$/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
