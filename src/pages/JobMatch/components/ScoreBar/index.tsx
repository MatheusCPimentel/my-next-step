interface ScoreBarProps {
  label: string;
  sublabel: string;
  value: number;
  barClass: string;
}

export function ScoreBar({ label, sublabel, value, barClass }: ScoreBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 shrink-0 flex flex-col">
        <span className="text-sm text-primary">{label}</span>
        <span className="text-xs text-muted">{sublabel}</span>
      </div>
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-10 text-right text-sm text-primary tabular-nums">
        {value}
      </span>
    </div>
  );
}
