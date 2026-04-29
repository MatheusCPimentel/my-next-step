import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { JobMatchForm } from "@/pages/JobMatch/components/JobMatchForm";
import { jobMatchSchema, type FormValues } from "@/pages/JobMatch/types";

interface HarnessProps {
  onValid?: (values: FormValues) => void;
  isSubmitDisabled?: boolean;
}

function Harness({ onValid = vi.fn(), isSubmitDisabled = false }: HarnessProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(jobMatchSchema),
    defaultValues: { title: "", description: "", additionalContext: "" },
  });

  return (
    <JobMatchForm
      titleBlock={<h1>Job Match</h1>}
      register={register}
      handleSubmit={handleSubmit}
      errors={errors}
      onValid={onValid}
      isSubmitDisabled={isSubmitDisabled}
    />
  );
}

describe("JobMatchForm", () => {
  it("shows both 'Title is required' and 'Description is required' when submitting empty", async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    render(<Harness onValid={onValid} />);

    await user.click(screen.getByRole("button", { name: /^analyze$/i }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();
  });

  it("shows only 'Description is required' when only the title is filled", async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    render(<Harness onValid={onValid} />);

    await user.type(
      screen.getByPlaceholderText("Senior Frontend Engineer at Acme"),
      "Senior Engineer",
    );
    await user.click(screen.getByRole("button", { name: /^analyze$/i }));

    expect(
      await screen.findByText("Description is required"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();
  });

  it("shows only 'Title is required' when only the description is filled", async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    render(<Harness onValid={onValid} />);

    await user.type(
      screen.getByPlaceholderText("Paste the full job description here..."),
      "Build great products with React.",
    );
    await user.click(screen.getByRole("button", { name: /^analyze$/i }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(
      screen.queryByText("Description is required"),
    ).not.toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();
  });

  it("calls onValid once with the typed values when both fields are filled", async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    render(<Harness onValid={onValid} />);

    await user.type(
      screen.getByPlaceholderText("Senior Frontend Engineer at Acme"),
      "Senior Engineer",
    );
    await user.type(
      screen.getByPlaceholderText("Paste the full job description here..."),
      "Build great products with React.",
    );
    await user.click(screen.getByRole("button", { name: /^analyze$/i }));

    expect(onValid).toHaveBeenCalledTimes(1);
    const submitted = onValid.mock.calls[0][0] as FormValues;
    expect(submitted.title).toBe("Senior Engineer");
    expect(submitted.description).toBe("Build great products with React.");
  });

  it("disables the Analyze button when isSubmitDisabled is true", () => {
    render(<Harness isSubmitDisabled={true} />);

    expect(screen.getByRole("button", { name: /^analyze$/i })).toBeDisabled();
  });
});
