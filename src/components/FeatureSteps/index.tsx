const DOT_COLOR_CLASS = {
  teal: "bg-teal",
  coral: "bg-[#D85A30]",
  amber: "bg-[#EF9F27]",
  purple: "bg-purple",
  blue: "bg-[#378ADD]",
  gray: "bg-muted",
} as const;

type FeatureStepsProps = {
  title: string;
  items: Array<{ title: string; description: string }>;
  extras?: Array<{
    label: string;
    color: keyof typeof DOT_COLOR_CLASS;
  }>;
};

export function FeatureSteps({ title, items, extras }: FeatureStepsProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="text-xs uppercase text-muted tracking-widest mb-3">
        {title}
      </div>
      <ol className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="w-6 h-6 shrink-0 rounded-full bg-purple/10 text-purple-mid text-xs font-medium flex items-center justify-center">
              {i + 1}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-primary">
                {item.title}
              </span>
              <span className="text-xs text-secondary mt-0.5">
                {item.description}
              </span>
            </div>
          </li>
        ))}
      </ol>
      {extras && extras.length > 0 && (
        <div className="border-t border-border mt-4 pt-4">
          <ul className="flex flex-col gap-2">
            {extras.map((extra, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_COLOR_CLASS[extra.color]}`}
                />
                <span className="text-xs text-muted">{extra.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
