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

  it("does not render a divider or extras labels when extras is omitted", () => {
    const { container } = render(
      <FeatureSteps title="Steps" items={makeItems()} />,
    );

    expect(container.querySelectorAll("ul")).toHaveLength(0);
    expect(container.querySelector(".border-t")).toBeNull();
  });

  it("does not render a divider or extras labels when extras is an empty array", () => {
    const { container } = render(
      <FeatureSteps title="Steps" items={makeItems()} extras={[]} />,
    );

    expect(container.querySelectorAll("ul")).toHaveLength(0);
    expect(container.querySelector(".border-t")).toBeNull();
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

  describe("extras dot color", () => {
    const cases = [
      { color: "teal" as const, label: "Teal item", token: "bg-teal" },
      { color: "coral" as const, label: "Coral item", token: "bg-[#D85A30]" },
      { color: "amber" as const, label: "Amber item", token: "bg-[#EF9F27]" },
      { color: "purple" as const, label: "Purple item", token: "bg-purple" },
      { color: "blue" as const, label: "Blue item", token: "bg-[#378ADD]" },
      { color: "gray" as const, label: "Gray item", token: "bg-muted" },
    ];

    cases.forEach(({ color, label, token }) => {
      it(`applies the ${token} class to the ${color} dot`, () => {
        render(
          <FeatureSteps
            title="Steps"
            items={makeItems()}
            extras={[{ label, color }]}
          />,
        );

        const labelEl = screen.getByText(label);
        const dot = labelEl.previousElementSibling;

        expect(dot).not.toBeNull();
        expect(dot?.className).toContain(token);
      });
    });
  });
});
