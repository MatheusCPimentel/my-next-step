import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionLabelTone = "secondary" | "muted";

type SectionLabelProps<E extends ElementType = "span"> = {
  as?: E;
  tone?: SectionLabelTone;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, "as" | "className" | "children">;

const TONE_CLASS: Record<SectionLabelTone, string> = {
  secondary: "text-secondary",
  muted: "text-muted",
};

export function SectionLabel<E extends ElementType = "span">({
  as,
  tone = "secondary",
  className,
  children,
  ...rest
}: SectionLabelProps<E>) {
  const Component = (as ?? "span") as ElementType;
  return (
    <Component
      className={cn(
        "text-xs uppercase tracking-widest",
        TONE_CLASS[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
