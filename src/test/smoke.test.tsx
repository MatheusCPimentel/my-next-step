import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}</p>;
}

describe("test setup", () => {
  it("runs a trivial assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("renders a react component with testing library", () => {
    render(<Greeting name="MyNextStep" />);
    expect(screen.getByText("Hello, MyNextStep")).toBeInTheDocument();
  });
});
