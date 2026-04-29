import { SectionLabel } from "@/components/SectionLabel";
import { cn } from "@/lib/utils";

interface StatCardProps {
  containerClassName?: string;
  label: string;
  value: number;
  valueClass: string;
}

export function StatCard({
  containerClassName,
  label,
  value,
  valueClass,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex-1 bg-surface rounded-lg p-4 flex flex-col gap-1",
        containerClassName,
      )}
    >
      <SectionLabel>{label}</SectionLabel>
      <span className={`text-2xl font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
