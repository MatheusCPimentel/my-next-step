export function signalDotClass(
  type: "positive" | "warning" | "negative",
): string {
  if (type === "positive") return "bg-teal";
  if (type === "warning") return "bg-amber";
  return "bg-red-500";
}
