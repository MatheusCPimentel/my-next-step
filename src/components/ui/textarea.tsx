import * as React from "react"

import { cn } from "@/lib/utils"

const BASE_CLASSES =
  "min-h-[72px] w-full min-w-0 bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none resize-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

function PlainTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(BASE_CLASSES, className)}
      {...props}
    />
  )
}

function CountedTextarea({
  className,
  maxLength,
  onChange,
  ...props
}: React.ComponentProps<"textarea"> & { maxLength: number }) {
  const initialCount =
    typeof props.value === "string"
      ? props.value.length
      : typeof props.defaultValue === "string"
        ? props.defaultValue.length
        : 0

  const [count, setCount] = React.useState(initialCount)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCount(e.target.value.length)
    onChange?.(e)
  }

  const isAtOrOver = count >= maxLength
  const isOver = count > maxLength

  return (
    <div>
      <textarea
        data-slot="textarea"
        className={cn(BASE_CLASSES, className, isOver && "border-red-500")}
        {...props}
        onChange={handleChange}
      />
      <div
        className={cn(
          "flex justify-end text-xs mt-1",
          isAtOrOver ? "text-red-500" : "text-muted"
        )}
      >
        {count} / {maxLength}
      </div>
    </div>
  )
}

function Textarea({ maxLength, ...props }: React.ComponentProps<"textarea">) {
  if (maxLength === undefined) {
    return <PlainTextarea {...props} />
  }
  return <CountedTextarea maxLength={maxLength} {...props} />
}

export { Textarea }
