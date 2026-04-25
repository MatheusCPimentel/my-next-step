export function signalIconClass(
  type: "positive" | "warning" | "negative",
): string {
  if (type === "positive") return "bg-teal/15 text-teal";
  if (type === "warning") return "bg-yellow-400/15 text-yellow-400";
  return "bg-red-500/15 text-red-500";
}
