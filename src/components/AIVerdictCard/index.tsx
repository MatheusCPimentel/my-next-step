import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

type AIVerdictCardProps = {
  title: string;
  verdict: string;
  action?: ReactNode;
};

export function AIVerdictCard({ title, verdict, action }: AIVerdictCardProps) {
  return (
    <section
      className={
        action
          ? "border border-purple/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4"
          : "border border-purple/20 rounded-xl p-5"
      }
      style={{
        background:
          "linear-gradient(180deg, rgba(83,74,183,0.15) 0%, transparent 100%)",
      }}
    >
      <div className={action ? "flex-1" : undefined}>
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-purple-mid" />
          <h2 className="text-sm font-medium text-primary">{title}</h2>
        </div>
        <p className="text-sm text-secondary mt-2 leading-relaxed">{verdict}</p>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </section>
  );
}
