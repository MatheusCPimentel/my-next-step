import * as React from "react";

import { cn } from "@/lib/utils";

const BASE_CLASSES =
  "w-full min-w-0 bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none resize-none placeholder:text-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

function PlainTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn("min-h-[72px]", BASE_CLASSES, className)}
      {...props}
    />
  );
}

function CountedTextarea({
  className,
  maxLength,
  onChange,
  error,
  ...props
}: React.ComponentProps<"textarea"> & { maxLength: number; error?: string }) {
  const initialCount =
    typeof props.value === "string"
      ? props.value.length
      : typeof props.defaultValue === "string"
        ? props.defaultValue.length
        : 0;

  const [count, setCount] = React.useState(initialCount);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCount(e.target.value.length);
    onChange?.(e);
  };

  const isAtOrOver = count >= maxLength;
  const isOver = count > maxLength;

  return (
    <div
      data-slot="textarea-wrapper"
      className={cn(
        "flex flex-col h-full overflow-hidden",
        className,
        (isOver || error) && "border-red-500",
      )}
    >
      <textarea
        data-slot="textarea"
        className={cn(BASE_CLASSES, "flex-1 min-h-[72px] border-0")}
        {...props}
        onChange={handleChange}
      />
      <div
        className={cn(
          "flex items-center text-xs px-2.5 py-1.5",
          error ? "justify-between" : "justify-end",
        )}
      >
        {error && <span className="text-red-500">{error}</span>}
        <span className={isAtOrOver ? "text-red-500" : "text-muted"}>
          {count} / {maxLength}
        </span>
      </div>
    </div>
  );
}

function Textarea({
  maxLength,
  error,
  ...props
}: React.ComponentProps<"textarea"> & { error?: string }) {
  if (maxLength === undefined) {
    return <PlainTextarea {...props} />;
  }
  return <CountedTextarea maxLength={maxLength} error={error} {...props} />;
}

export { Textarea };
