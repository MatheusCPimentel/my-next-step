import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { BoardColumn } from "@/pages/Board/components/BoardColumn";
import type { Column, Job } from "@/pages/Board/types";

const makeColumn = (overrides: Partial<Column> = {}): Column => ({
  id: "col-1",
  label: "Phone Screen",
  locked: false,
  ...overrides,
});

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: "job-1",
  company: "Acme",
  title: "Frontend Engineer",
  description: "",
  requiredSkills: [],
  niceToHaveSkills: [],
  columnId: "col-1",
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-01T00:00:00.000Z",
  stageHistory: [{ stage: "Applied", date: "2026-04-01T00:00:00.000Z" }],
  fromJobMatch: false,
  ...overrides,
});

function renderColumn(props: {
  column: Column;
  jobs?: Job[];
  onRename?: (id: string, label: string) => void;
  onDelete?: (id: string) => void;
  initialEditing?: boolean;
  onEditCancel?: (id: string) => void;
}) {
  const {
    column,
    jobs = [],
    onRename = vi.fn(),
    onDelete = vi.fn(),
    initialEditing,
    onEditCancel,
  } = props;
  return render(
    <DndContext>
      <SortableContext items={[column.id]}>
        <BoardColumn
          column={column}
          jobs={jobs}
          onRename={onRename}
          onDelete={onDelete}
          initialEditing={initialEditing}
          onEditCancel={onEditCancel}
        />
      </SortableContext>
    </DndContext>,
  );
}

describe("BoardColumn", () => {
  describe("locked columns", () => {
    it("does not render a delete button", () => {
      renderColumn({ column: makeColumn({ locked: true, label: "Applied" }) });

      expect(
        screen.queryByRole("button", { name: /delete column/i }),
      ).not.toBeInTheDocument();
    });

    it("does not enter edit mode on double click of the label", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      renderColumn({
        column: makeColumn({ locked: true, label: "Applied" }),
        onRename,
      });

      await user.dblClick(screen.getByText("Applied"));

      expect(screen.queryByDisplayValue("Applied")).not.toBeInTheDocument();
      expect(onRename).not.toHaveBeenCalled();
    });

  });

  describe("moveable columns - rename", () => {
    it("double-clicking a non-locked column's label shows an input that is auto-focused", async () => {
      const user = userEvent.setup();
      renderColumn({ column: makeColumn() });

      await user.dblClick(screen.getByText("Phone Screen"));

      const input = screen.getByDisplayValue("Phone Screen");
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    it("enters edit mode on double click and commits via onRename on Enter", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      renderColumn({ column: makeColumn(), onRename });

      await user.dblClick(screen.getByText("Phone Screen"));

      const input = screen.getByDisplayValue("Phone Screen");
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "Tech Interview" } });
      await user.keyboard("{Enter}");

      expect(onRename).toHaveBeenCalledTimes(1);
      expect(onRename).toHaveBeenCalledWith("col-1", "Tech Interview");
    });

    it("cancels rename on Escape and does not call onRename", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      renderColumn({ column: makeColumn(), onRename });

      await user.dblClick(screen.getByText("Phone Screen"));
      const input = screen.getByDisplayValue("Phone Screen");
      fireEvent.change(input, { target: { value: "Something Else" } });
      await user.keyboard("{Escape}");

      expect(onRename).not.toHaveBeenCalled();
      expect(screen.getByText("Phone Screen")).toBeInTheDocument();
    });

    it("reverts to the original label on blur with an empty string", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      renderColumn({ column: makeColumn(), onRename });

      await user.dblClick(screen.getByText("Phone Screen"));
      const input = screen.getByDisplayValue("Phone Screen");
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.blur(input);

      expect(onRename).not.toHaveBeenCalled();
      expect(screen.getByText("Phone Screen")).toBeInTheDocument();
    });

    it("commits via onRename on blur with a valid trimmed string", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      renderColumn({ column: makeColumn(), onRename });

      await user.dblClick(screen.getByText("Phone Screen"));
      const input = screen.getByDisplayValue("Phone Screen");
      fireEvent.change(input, { target: { value: "  Final Round  " } });
      fireEvent.blur(input);

      expect(onRename).toHaveBeenCalledTimes(1);
      expect(onRename).toHaveBeenCalledWith("col-1", "Final Round");
    });
  });

  describe("moveable columns - delete", () => {
    it("opens the confirm dialog on trash click for an empty column and calls onDelete on confirm", { retry: 2 }, async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      renderColumn({ column: makeColumn(), jobs: [], onDelete });

      fireEvent.click(
        screen.getByRole("button", { name: /delete column/i, hidden: true }),
      );

      const dialog = await screen.findByRole("dialog");
      expect(
        within(dialog).getByText(/Delete "Phone Screen"\?/i),
      ).toBeInTheDocument();

      await user.click(within(dialog).getByRole("button", { name: /^delete$/i }));

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith("col-1");
    });

    it("opens the block dialog and does not call onDelete when the column has jobs", { retry: 2 }, async () => {
      const onDelete = vi.fn();
      renderColumn({
        column: makeColumn(),
        jobs: [makeJob()],
        onDelete,
      });

      fireEvent.click(
        screen.getByRole("button", { name: /delete column/i, hidden: true }),
      );

      const dialog = await screen.findByRole("dialog");
      expect(
        within(dialog).getByText(/cannot delete column/i),
      ).toBeInTheDocument();
      expect(
        within(dialog).queryByRole("button", { name: /^delete$/i }),
      ).not.toBeInTheDocument();
      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe("count badge", () => {
    it("shows 0 when there are no jobs", () => {
      renderColumn({ column: makeColumn(), jobs: [] });

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("reflects jobs.length", () => {
      renderColumn({
        column: makeColumn(),
        jobs: [
          makeJob({ id: "j-1" }),
          makeJob({ id: "j-2" }),
          makeJob({ id: "j-3" }),
        ],
      });

      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  describe("pending column (initialEditing + onEditCancel)", () => {
    it("mounts in edit mode when initialEditing is true and focuses the input", () => {
      renderColumn({
        column: makeColumn({ label: "" }),
        initialEditing: true,
        onEditCancel: vi.fn(),
      });

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    it("calls onRename with the trimmed name on Enter and does not call onEditCancel", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      const onEditCancel = vi.fn();
      renderColumn({
        column: makeColumn({ label: "" }),
        initialEditing: true,
        onRename,
        onEditCancel,
      });

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "  Tech Screen  " } });
      await user.keyboard("{Enter}");

      expect(onRename).toHaveBeenCalledTimes(1);
      expect(onRename).toHaveBeenCalledWith("col-1", "Tech Screen");
      expect(onEditCancel).not.toHaveBeenCalled();
    });

    it("calls onEditCancel on Enter when the input is empty", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      const onEditCancel = vi.fn();
      renderColumn({
        column: makeColumn({ label: "" }),
        initialEditing: true,
        onRename,
        onEditCancel,
      });

      await user.keyboard("{Enter}");

      expect(onEditCancel).toHaveBeenCalledTimes(1);
      expect(onEditCancel).toHaveBeenCalledWith("col-1");
      expect(onRename).not.toHaveBeenCalled();
    });

    it("calls onEditCancel on Escape", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      const onEditCancel = vi.fn();
      renderColumn({
        column: makeColumn({ label: "" }),
        initialEditing: true,
        onRename,
        onEditCancel,
      });

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "anything" } });
      await user.keyboard("{Escape}");

      expect(onEditCancel).toHaveBeenCalledTimes(1);
      expect(onEditCancel).toHaveBeenCalledWith("col-1");
      expect(onRename).not.toHaveBeenCalled();
    });

    it("calls onEditCancel on blur with an empty value", () => {
      const onRename = vi.fn();
      const onEditCancel = vi.fn();
      renderColumn({
        column: makeColumn({ label: "" }),
        initialEditing: true,
        onRename,
        onEditCancel,
      });

      const input = screen.getByRole("textbox");
      fireEvent.blur(input);

      expect(onEditCancel).toHaveBeenCalledTimes(1);
      expect(onEditCancel).toHaveBeenCalledWith("col-1");
      expect(onRename).not.toHaveBeenCalled();
    });

    it("treats whitespace-only input as empty and routes to onEditCancel on Enter", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      const onEditCancel = vi.fn();
      renderColumn({
        column: makeColumn({ label: "" }),
        initialEditing: true,
        onRename,
        onEditCancel,
      });

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "   " } });
      await user.keyboard("{Enter}");

      expect(onEditCancel).toHaveBeenCalledTimes(1);
      expect(onEditCancel).toHaveBeenCalledWith("col-1");
      expect(onRename).not.toHaveBeenCalled();
    });
  });

  describe("legacy rename without onEditCancel", () => {
    it("reverts the draft on Escape and does not call any callback", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      renderColumn({ column: makeColumn(), onRename });

      await user.dblClick(screen.getByText("Phone Screen"));
      const input = screen.getByDisplayValue("Phone Screen");
      fireEvent.change(input, { target: { value: "Throwaway" } });
      await user.keyboard("{Escape}");

      expect(onRename).not.toHaveBeenCalled();
      expect(screen.getByText("Phone Screen")).toBeInTheDocument();
    });

    it("reverts to the original label when Enter is pressed on an empty input", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      renderColumn({ column: makeColumn(), onRename });

      await user.dblClick(screen.getByText("Phone Screen"));
      const input = screen.getByDisplayValue("Phone Screen");
      fireEvent.change(input, { target: { value: "" } });
      await user.keyboard("{Enter}");

      expect(onRename).not.toHaveBeenCalled();
      expect(screen.getByText("Phone Screen")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("renders 'No applications yet' when jobs is empty", () => {
      renderColumn({ column: makeColumn(), jobs: [] });

      expect(screen.getByText(/no applications yet/i)).toBeInTheDocument();
    });

    it("does not render the empty state when jobs has at least one item", () => {
      renderColumn({
        column: makeColumn(),
        jobs: [makeJob()],
      });

      expect(
        screen.queryByText(/no applications yet/i),
      ).not.toBeInTheDocument();
    });
  });
});
