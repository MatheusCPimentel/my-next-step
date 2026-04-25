import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagInput } from "@/components/TagInput";
import type { Skill, SkillVariant } from "@/pages/Board/types";

const makeSkill = (overrides: Partial<Skill> = {}): Skill => ({
  name: "React",
  variant: "neutral",
  ...overrides,
});

interface HarnessProps {
  initial?: Skill[];
  isEditable?: boolean;
  defaultVariant?: SkillVariant;
  placeholder?: string;
  onChange?: (skills: Skill[]) => void;
}

function Harness({
  initial = [],
  isEditable = true,
  defaultVariant,
  placeholder,
  onChange,
}: HarnessProps) {
  const [value, setValue] = useState<Skill[]>(initial);
  return (
    <TagInput
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      isEditable={isEditable}
      defaultVariant={defaultVariant}
      placeholder={placeholder}
    />
  );
}

describe("TagInput", () => {
  it("appends a new tag with the default neutral variant when Enter is pressed with non-empty input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} placeholder="Add skill" />);

    const input = screen.getByPlaceholderText("Add skill");
    await user.type(input, "TypeScript{Enter}");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith([
      { name: "TypeScript", variant: "neutral" },
    ]);
  });

  it("uses defaultVariant when provided", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness
        onChange={onChange}
        defaultVariant="success"
        placeholder="Add skill"
      />,
    );

    await user.type(screen.getByPlaceholderText("Add skill"), "Go{Enter}");

    expect(onChange).toHaveBeenLastCalledWith([
      { name: "Go", variant: "success" },
    ]);
  });

  it("appends a tag when the arrow button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} placeholder="Add skill" />);

    await user.type(screen.getByPlaceholderText("Add skill"), "Vitest");
    await user.click(screen.getByRole("button", { name: /add tag/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith([
      { name: "Vitest", variant: "neutral" },
    ]);
  });

  it("trims whitespace around the entered tag name", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} placeholder="Add skill" />);

    await user.type(
      screen.getByPlaceholderText("Add skill"),
      "  Tailwind  {Enter}",
    );

    expect(onChange).toHaveBeenLastCalledWith([
      { name: "Tailwind", variant: "neutral" },
    ]);
  });

  it("clears the input draft after a successful commit", async () => {
    const user = userEvent.setup();
    render(<Harness placeholder="Add skill" />);

    const input = screen.getByPlaceholderText("Add skill") as HTMLInputElement;
    await user.type(input, "React{Enter}");

    expect(input.value).toBe("");
  });

  it("does not append a tag for an empty input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} placeholder="Add skill" />);

    await user.click(screen.getByPlaceholderText("Add skill"));
    await user.keyboard("{Enter}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not append a tag for whitespace-only input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} placeholder="Add skill" />);

    await user.type(screen.getByPlaceholderText("Add skill"), "   {Enter}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes a pill when its X button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness
        initial={[
          makeSkill({ name: "React" }),
          makeSkill({ name: "TypeScript" }),
        ]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /remove react/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith([
      { name: "TypeScript", variant: "neutral" },
    ]);
  });

  it("renders only pills (no input or arrow button) when isEditable is false", () => {
    render(
      <Harness
        isEditable={false}
        initial={[makeSkill({ name: "React" })]}
        placeholder="Add skill"
      />,
    );

    expect(screen.queryByPlaceholderText("Add skill")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /add tag/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remove react/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders a colored dot before each pill name with the variant class", () => {
    render(
      <Harness
        isEditable={false}
        initial={[makeSkill({ name: "React", variant: "success" })]}
      />,
    );

    const pill = screen.getByText("React").closest("span");
    expect(pill).not.toBeNull();
    const dot = pill!.querySelector("span");
    expect(dot).not.toBeNull();
    expect(dot).toHaveClass("w-1.5", "h-1.5", "rounded-full", "bg-teal");
  });

  it("returns null when isEditable is false and value is empty", () => {
    const { container } = render(<Harness isEditable={false} initial={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  describe("duplicate prevention", () => {
    it("does not append a tag when the same name is submitted twice in a row", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness onChange={onChange} placeholder="Add skill" />);

      const input = screen.getByPlaceholderText("Add skill");
      await user.type(input, "React{Enter}");
      await user.type(input, "React{Enter}");

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith([
        { name: "React", variant: "neutral" },
      ]);
    });

    it("treats names as case-insensitive when checking for duplicates", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Harness
          initial={[makeSkill({ name: "react" })]}
          onChange={onChange}
          placeholder="Add skill"
        />,
      );

      await user.type(screen.getByPlaceholderText("Add skill"), "REACT{Enter}");

      expect(onChange).not.toHaveBeenCalled();
    });

    it("ignores surrounding whitespace when checking for duplicates", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Harness
          initial={[makeSkill({ name: "react" })]}
          onChange={onChange}
          placeholder="Add skill"
        />,
      );

      await user.type(
        screen.getByPlaceholderText("Add skill"),
        "  react  {Enter}",
      );

      expect(onChange).not.toHaveBeenCalled();
    });

    it("clears the input draft after a duplicate submission", async () => {
      const user = userEvent.setup();
      render(
        <Harness
          initial={[makeSkill({ name: "React" })]}
          placeholder="Add skill"
        />,
      );

      const input = screen.getByPlaceholderText("Add skill") as HTMLInputElement;
      await user.type(input, "React{Enter}");

      expect(input.value).toBe("");
    });
  });
});
