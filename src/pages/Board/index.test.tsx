import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Board } from "@/pages/Board";

describe("Board (initial render)", () => {
  it("renders the Add Column placeholder and no column header is in edit mode on mount", () => {
    render(<Board />);

    expect(
      screen.getByRole("button", { name: /add column/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
