export function signalDotClass(
  type: "positive" | "warning" | "negative",
): string {
  if (type === "positive") return "bg-teal";
  if (type === "warning") return "bg-[#EF9F27]";
  return "bg-red-500";
}
