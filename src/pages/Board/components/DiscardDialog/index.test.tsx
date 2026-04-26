import { describe, expect, it, vi } from "vitest";
import { useEffect, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiscardDialog } from "@/pages/Board/components/DiscardDialog";
import type { DiscardOption } from "@/pages/Board/components/DiscardDialog";
import type { Column } from "@/pages/Board/types";

const makeColumns = (): Column[] => [
  { id: "applied", label: "Applied", locked: true },
  { id: "phone", label: "Phone Screen", locked: false },
  { id: "tech", label: "Tech Interview", locked: false },
  { id: "offer", label: "Offer", locked: true },
];

interface HarnessProps {
  initialOpen?: boolean;
  onConfirm?: (option: DiscardOption) => void;
  jobCompany?: string;
  columns?: Column[];
}

function Harness({
  initialOpen = true,
  onConfirm = vi.fn() as (option: DiscardOption) => void,
  jobCompany = "Acme",
  columns = makeColumns(),
}: HarnessProps) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        external-open
      </button>
      <button type="button" onClick={() => setOpen(false)}>
        external-close
      </button>
      <DiscardDialog
        open={open}
        onOpenChange={setOpen}
        jobCompany={jobCompany}
        columns={columns}
        onConfirm={onConfirm}
      />
    </>
  );
}

const stepThroughToDebrief = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.click(screen.getByRole("button", { name: /^rejected/i }));
  await user.click(screen.getByRole("button", { name: /phone screen/i }));
};

describe("DiscardDialog", () => {
  describe("discard branch", () => {
    it("calls onConfirm with kind discard immediately when the Discard card is clicked", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} />);

      await user.click(screen.getByRole("button", { name: /^discard/i }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith({ kind: "discard" });
    });
  });

  describe("rejected branch - happy path", () => {
    it("walks through choose -> stage -> debrief -> confirm with valid pairs", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} />);

      await user.click(screen.getByRole("button", { name: /^rejected/i }));
      expect(
        screen.getByText(/which stage were you rejected at/i),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /tech interview/i }));
      expect(screen.getByText(/what went wrong/i)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /add question/i }));
      const inputs = screen.getAllByPlaceholderText("Question they asked");
      const answers = screen.getAllByPlaceholderText(
        /what should the answer have been/i,
      );
      await user.type(inputs[0], "Why this company?");
      await user.type(answers[0], "Their mission resonated.");

      await user.click(screen.getByRole("button", { name: /^confirm$/i }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith({
        kind: "rejected",
        stageId: "tech",
        questions: [
          { question: "Why this company?", answer: "Their mission resonated." },
        ],
      });
    });
  });

  describe("zero-pairs optional submit", () => {
    it("confirms with an empty questions array when no pairs were added", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} />);

      await stepThroughToDebrief(user);
      await user.click(screen.getByRole("button", { name: /^confirm$/i }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith({
        kind: "rejected",
        stageId: "phone",
        questions: [],
      });
    });
  });

  describe("debrief validation", () => {
    it("blocks Confirm and marks empty question as aria-invalid when answer has text", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} />);

      await stepThroughToDebrief(user);
      await user.click(screen.getByRole("button", { name: /add question/i }));

      const answer = screen.getByPlaceholderText(
        /what should the answer have been/i,
      );
      await user.type(answer, "Some answer text.");

      await user.click(screen.getByRole("button", { name: /^confirm$/i }));

      expect(onConfirm).not.toHaveBeenCalled();
      const question = screen.getByPlaceholderText("Question they asked");
      expect(question).toHaveAttribute("aria-invalid", "true");
    });

    it("blocks Confirm and marks empty answer as aria-invalid when question has text", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} />);

      await stepThroughToDebrief(user);
      await user.click(screen.getByRole("button", { name: /add question/i }));

      const question = screen.getByPlaceholderText("Question they asked");
      await user.type(question, "Tell me about yourself");

      await user.click(screen.getByRole("button", { name: /^confirm$/i }));

      expect(onConfirm).not.toHaveBeenCalled();
      const answer = screen.getByPlaceholderText(
        /what should the answer have been/i,
      );
      expect(answer).toHaveAttribute("aria-invalid", "true");
    });

    it("treats whitespace-only fields as invalid", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} />);

      await stepThroughToDebrief(user);
      await user.click(screen.getByRole("button", { name: /add question/i }));

      const question = screen.getByPlaceholderText("Question they asked");
      const answer = screen.getByPlaceholderText(
        /what should the answer have been/i,
      );
      await user.type(question, "   ");
      await user.type(answer, "   ");

      await user.click(screen.getByRole("button", { name: /^confirm$/i }));

      expect(onConfirm).not.toHaveBeenCalled();
      expect(question).toHaveAttribute("aria-invalid", "true");
      expect(answer).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("8-question limit", () => {
    it("hides the Add question button at 8 pairs and restores it after removing one", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await stepThroughToDebrief(user);

      for (let i = 0; i < 8; i++) {
        await user.click(screen.getByRole("button", { name: /add question/i }));
      }

      expect(
        screen.queryByRole("button", { name: /add question/i }),
      ).not.toBeInTheDocument();
      expect(screen.getAllByPlaceholderText("Question they asked")).toHaveLength(
        8,
      );

      const removeButtons = screen.getAllByRole("button", {
        name: /remove question/i,
      });
      await user.click(removeButtons[0]);

      expect(
        screen.getByRole("button", { name: /add question/i }),
      ).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText("Question they asked")).toHaveLength(
        7,
      );
    });
  });

  describe("state reset on close", () => {
    it("resets to the choose step with no leftover questions or stageId when parent closes and reopens", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<Harness onConfirm={onConfirm} />);

      await stepThroughToDebrief(user);
      await user.click(screen.getByRole("button", { name: /add question/i }));
      await user.type(
        screen.getByPlaceholderText("Question they asked"),
        "leftover question",
      );

      fireEvent.click(screen.getByText("external-close"));
      fireEvent.click(screen.getByText("external-open"));

      expect(await screen.findByText(/remove acme\?/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^discard/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("Question they asked"),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /^rejected/i }));
      await user.click(screen.getByRole("button", { name: /tech interview/i }));
      await user.click(screen.getByRole("button", { name: /^confirm$/i }));

      expect(onConfirm).toHaveBeenCalledWith({
        kind: "rejected",
        stageId: "tech",
        questions: [],
      });
    });

    it("resets state when closed via onOpenChange(false) (Esc / X / outside click)", async () => {
      const user = userEvent.setup();
      const ref: { setOpen: ((open: boolean) => void) | null } = {
        setOpen: null,
      };

      function Wrapper() {
        const [open, setOpen] = useState(true);
        useEffect(() => {
          ref.setOpen = setOpen;
        }, []);
        return (
          <DiscardDialog
            open={open}
            onOpenChange={setOpen}
            jobCompany="Acme"
            columns={makeColumns()}
            onConfirm={vi.fn()}
          />
        );
      }

      render(<Wrapper />);

      await stepThroughToDebrief(user);
      await user.click(screen.getByRole("button", { name: /add question/i }));
      await user.type(
        screen.getByPlaceholderText("Question they asked"),
        "leftover",
      );

      act(() => {
        ref.setOpen!(false);
      });
      act(() => {
        ref.setOpen!(true);
      });

      expect(await screen.findByText(/remove acme\?/i)).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("Question they asked"),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^discard/i }),
      ).toBeInTheDocument();
    });

    it("clears the showErrors flag on close so reopening does not flag empty fields", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await stepThroughToDebrief(user);
      await user.click(screen.getByRole("button", { name: /add question/i }));
      await user.type(
        screen.getByPlaceholderText("Question they asked"),
        "Q only",
      );
      await user.click(screen.getByRole("button", { name: /^confirm$/i }));

      const answer = screen.getByPlaceholderText(
        /what should the answer have been/i,
      );
      expect(answer).toHaveAttribute("aria-invalid", "true");

      fireEvent.click(screen.getByText("external-close"));
      fireEvent.click(screen.getByText("external-open"));

      await screen.findByText(/remove acme\?/i);
      await user.click(screen.getByRole("button", { name: /^rejected/i }));
      await user.click(screen.getByRole("button", { name: /phone screen/i }));
      await user.click(screen.getByRole("button", { name: /add question/i }));

      expect(
        screen.getByPlaceholderText("Question they asked"),
      ).not.toHaveAttribute("aria-invalid", "true");
      expect(
        screen.getByPlaceholderText(/what should the answer have been/i),
      ).not.toHaveAttribute("aria-invalid", "true");
    });
  });
});
