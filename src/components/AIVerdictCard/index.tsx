import { Sparkles } from "lucide-react";

type AIVerdictCardProps = {
  title: string;
  verdict: string;
};

export function AIVerdictCard({ title, verdict }: AIVerdictCardProps) {
  return (
    <section
      className="border border-purple/20 rounded-xl p-5"
      style={{
        background:
          "linear-gradient(180deg, rgba(83,74,183,0.15) 0%, transparent 100%)",
      }}
    >
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-purple-mid" />
        <h2 className="text-sm font-medium text-primary">{title}</h2>
      </div>
      <p className="text-sm text-secondary mt-2 leading-relaxed">{verdict}</p>
    </section>
  );
}
