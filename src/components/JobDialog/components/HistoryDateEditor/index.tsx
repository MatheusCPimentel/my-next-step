import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type HistoryDateEditorProps = {
  date: string;
  onChange: (iso: string) => void;
};

function toIsoNoonUTCFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T12:00:00.000Z`;
}

function toIsoNoonUTC(yyyyMmDd: string): string {
  return `${yyyyMmDd}T12:00:00.000Z`;
}

function toYMD(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return true;
    }
    return window.matchMedia("(min-width: 768px)").matches;
  });
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mq = window.matchMedia("(min-width: 768px)");
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return isDesktop;
}

export function HistoryDateEditor({ date, onChange }: HistoryDateEditorProps) {
  const [editing, setEditing] = useState(false);
  const isDesktop = useIsDesktop();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing && !isDesktop && inputRef.current) {
      try {
        inputRef.current.showPicker?.();
      } catch {
        // showPicker not supported
      }
    }
  }, [editing, isDesktop]);

  const handlePick = (day: Date | undefined) => {
    if (day) {
      onChange(toIsoNoonUTCFromDate(day));
    }
    setEditing(false);
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onChange(toIsoNoonUTC(value));
    }
    setEditing(false);
  };

  const formatted = format(new Date(date), "MMM d, yyyy");

  if (!isDesktop && editing) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-muted">
        <input
          ref={inputRef}
          type="date"
          value={toYMD(date)}
          onChange={handleNativeChange}
          onBlur={() => setEditing(false)}
          className="bg-overlay border border-border rounded px-2 py-0.5 text-sm text-primary"
        />
      </span>
    );
  }

  if (isDesktop) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-muted">
        <span>{formatted}</span>
        <Popover
          open={editing}
          onOpenChange={(o) => {
            if (!o) setEditing(false);
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Edit date"
              onClick={() => setEditing(true)}
              className="text-muted hover:text-primary transition-colors inline-flex items-center"
            >
              <Pencil size={12} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={new Date(date)}
              onSelect={handlePick}
            />
          </PopoverContent>
        </Popover>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      <span>{formatted}</span>
      <button
        type="button"
        aria-label="Edit date"
        onClick={() => setEditing(true)}
        className="text-muted hover:text-primary transition-colors inline-flex items-center"
      >
        <Pencil size={12} />
      </button>
    </span>
  );
}
