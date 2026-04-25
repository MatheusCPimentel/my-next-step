export function SkillLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      <span className="inline-flex items-center gap-1.5 text-[10px] text-secondary">
        <span className="w-1.5 h-1.5 rounded-full inline-block bg-teal" />{" "}
        Strong fit
      </span>
      <span className="inline-flex items-center gap-1.5 text-[10px] text-secondary">
        <span className="w-1.5 h-1.5 rounded-full inline-block bg-yellow-400" />{" "}
        Partial fit
      </span>
      <span className="inline-flex items-center gap-1.5 text-[10px] text-secondary">
        <span className="w-1.5 h-1.5 rounded-full inline-block bg-red-500" />{" "}
        Not a fit
      </span>
    </div>
  );
}
