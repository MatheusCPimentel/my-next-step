import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  icon,
  className,
  children,
}: {
  title: string;
  icon: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 h-full",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-overlay flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-sm font-medium text-primary">{title}</h2>
      </div>
      {children}
    </section>
  );
}
