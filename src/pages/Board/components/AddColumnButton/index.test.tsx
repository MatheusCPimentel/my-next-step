import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { AddColumnButton } from "@/pages/Board/components/AddColumnButton";

describe("AddColumnButton", () => {
  it("renders nothing when disabled (20-column cap)", () => {
    const onAdd = vi.fn();
    const { container } = render(
      <AddColumnButton onAdd={onAdd} disabled={true} />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("button", { name: /add column/i })).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Column name")).not.toBeInTheDocument();
  });

  it("renders the trigger button when enabled", () => {
    render(<AddColumnButton onAdd={vi.fn()} />);

    expect(screen.getByRole("button", { name: /add column/i })).toBeInTheDocument();
  });

  it("enters editing mode and shows input on click", async () => {
    const user = userEvent.setup();
    render(<AddColumnButton onAdd={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /add column/i }));

    expect(screen.getByPlaceholderText("Column name")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add column/i })).not.toBeInTheDocument();
  });

  it("commits a non-empty value on Enter and calls onAdd with the trimmed label", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddColumnButton onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: /add column/i }));
    const input = screen.getByPlaceholderText("Column name");
    await user.type(input, "  Phone Screen  {Enter}");

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith("Phone Screen");
  });

  it("does not call onAdd when Enter is pressed with an empty value", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddColumnButton onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: /add column/i }));
    const input = screen.getByPlaceholderText("Column name");
    await user.type(input, "{Enter}");

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd when Enter is pressed with only whitespace", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddColumnButton onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: /add column/i }));
    const input = screen.getByPlaceholderText("Column name");
    await user.type(input, "    {Enter}");

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("cancels editing and discards input on Escape", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddColumnButton onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: /add column/i }));
    const input = screen.getByPlaceholderText("Column name");
    await user.type(input, "Draft");
    await user.keyboard("{Escape}");

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText("Column name")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add column/i })).toBeInTheDocument();
  });

  it("clears the draft after a successful commit so the next session starts empty", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddColumnButton onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: /add column/i }));
    await user.type(screen.getByPlaceholderText("Column name"), "First{Enter}");

    await user.click(screen.getByRole("button", { name: /add column/i }));
    const input = screen.getByPlaceholderText("Column name");
    expect(input).toHaveValue("");
  });

  it("clears the draft after Escape so reopening starts empty", async () => {
    const user = userEvent.setup();
    render(<AddColumnButton onAdd={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /add column/i }));
    await user.type(screen.getByPlaceholderText("Column name"), "Throwaway");
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: /add column/i }));
    expect(screen.getByPlaceholderText("Column name")).toHaveValue("");
  });

  it("commits via onAdd on blur with a non-empty trimmed value", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddColumnButton onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: /add column/i }));
    const input = screen.getByPlaceholderText("Column name");
    await user.type(input, "  Final Round  ");
    fireEvent.blur(input);

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith("Final Round");
  });

  it("does not call onAdd on blur with an empty input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddColumnButton onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: /add column/i }));
    fireEvent.blur(screen.getByPlaceholderText("Column name"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("focuses the input automatically when entering edit mode", async () => {
    const user = userEvent.setup();
    render(<AddColumnButton onAdd={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /add column/i }));

    expect(screen.getByPlaceholderText("Column name")).toHaveFocus();
  });

  describe("droppable wiring", () => {
    it("renders the trigger button without highlight when no card is being dragged over it", () => {
      render(
        <DndContext>
          <AddColumnButton onAdd={vi.fn()} />
        </DndContext>,
      );

      const button = screen.getByRole("button", { name: /add column/i });
      expect(button).toBeInTheDocument();
      expect(button.className).not.toContain("bg-purple/10");
    });

    it("still enters editing mode on click when wrapped in a DndContext", async () => {
      const user = userEvent.setup();
      render(
        <DndContext>
          <AddColumnButton onAdd={vi.fn()} />
        </DndContext>,
      );

      await user.click(screen.getByRole("button", { name: /add column/i }));

      expect(screen.getByPlaceholderText("Column name")).toBeInTheDocument();
    });
  });
});

describe("AddColumnButton — droppable highlight (with mocked useDroppable)", () => {
  it("applies the highlight classes when a card is dragged over it", async () => {
    vi.resetModules();
    vi.doMock("@dnd-kit/core", async () => {
      const actual = await vi.importActual<typeof import("@dnd-kit/core")>(
        "@dnd-kit/core",
      );
      return {
        ...actual,
        useDroppable: () => ({
          setNodeRef: () => {},
          isOver: true,
          active: { data: { current: { type: "card" } } },
          node: { current: null },
          over: null,
          rect: { current: null },
        }),
      };
    });

    const { AddColumnButton: Mocked } = await import(
      "@/pages/Board/components/AddColumnButton"
    );

    render(<Mocked onAdd={vi.fn()} />);

    const button = screen.getByRole("button", { name: /add column/i });
    expect(button.className).toContain("border-purple");
    expect(button.className).toContain("bg-purple/10");

    vi.doUnmock("@dnd-kit/core");
    vi.resetModules();
  });

  it("does NOT apply the highlight when the active drag is not a card", async () => {
    vi.resetModules();
    vi.doMock("@dnd-kit/core", async () => {
      const actual = await vi.importActual<typeof import("@dnd-kit/core")>(
        "@dnd-kit/core",
      );
      return {
        ...actual,
        useDroppable: () => ({
          setNodeRef: () => {},
          isOver: true,
          active: { data: { current: { type: "column" } } },
          node: { current: null },
          over: null,
          rect: { current: null },
        }),
      };
    });

    const { AddColumnButton: Mocked } = await import(
      "@/pages/Board/components/AddColumnButton"
    );

    render(<Mocked onAdd={vi.fn()} />);

    const button = screen.getByRole("button", { name: /add column/i });
    expect(button.className).not.toContain("bg-purple/10");

    vi.doUnmock("@dnd-kit/core");
    vi.resetModules();
  });
});
