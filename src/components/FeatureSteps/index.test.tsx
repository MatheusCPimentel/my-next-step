import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { FeatureSteps } from "@/components/FeatureSteps";

const makeItems = () => [
  { title: "Upload resume", description: "Drop your PDF" },
  { title: "Analyze content", description: "We score it" },
  { title: "Improve sections", description: "Apply suggestions" },
];

describe("FeatureSteps", () => {
  it("renders the title text", () => {
    render(<FeatureSteps title="How it works" items={makeItems()} />);

    expect(screen.getByText("How it works")).toBeInTheDocument();
  });

  it("renders all step titles and descriptions in the order provided", () => {
    const items = makeItems();
    render(<FeatureSteps title="Steps" items={items} />);

    const list = screen.getByRole("list");
    const listItems = within(list).getAllByRole("listitem");

    expect(listItems).toHaveLength(items.length);
    items.forEach((item, i) => {
      expect(listItems[i]).toHaveTextContent(item.title);
      expect(listItems[i]).toHaveTextContent(item.description);
    });
  });

  it("renders 1-based numbers for each step", () => {
    const items = makeItems();
    render(<FeatureSteps title="Steps" items={items} />);

    const listItems = within(screen.getByRole("list")).getAllByRole("listitem");

    listItems.forEach((li, i) => {
      expect(li).toHaveTextContent(String(i + 1));
    });
  });

  it("does not render any extras label when extras is omitted or empty", () => {
    const knownLabels = ["Strong match", "Needs work", "Optional"];

    const { rerender } = render(
      <FeatureSteps title="Steps" items={makeItems()} />,
    );
    for (const label of knownLabels) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }

    rerender(<FeatureSteps title="Steps" items={makeItems()} extras={[]} />);
    for (const label of knownLabels) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
  });

  it("renders every extras label when extras is provided", () => {
    const extras = [
      { label: "Strong match", color: "teal" as const },
      { label: "Needs work", color: "coral" as const },
      { label: "Optional", color: "gray" as const },
    ];
    render(
      <FeatureSteps title="Steps" items={makeItems()} extras={extras} />,
    );

    extras.forEach((extra) => {
      expect(screen.getByText(extra.label)).toBeInTheDocument();
    });
  });
});
