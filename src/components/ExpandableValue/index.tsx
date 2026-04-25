import { useLayoutEffect, useRef, useState } from "react";

interface ExpandableValueProps {
  value: string | undefined;
  className?: string;
}

const DEFAULT_CLASS = "text-sm text-primary whitespace-pre-wrap";

export function ExpandableValue({
  value,
  className = DEFAULT_CLASS,
}: ExpandableValueProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [value]);

  if (!value) {
    return (
      <p className={className}>
        <span className="text-muted">—</span>
      </p>
    );
  }

  return (
    <>
      <p ref={ref} className={`${className} ${expanded ? "" : "line-clamp-4"}`}>
        {value}
      </p>
      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors self-start"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </>
  );
}
