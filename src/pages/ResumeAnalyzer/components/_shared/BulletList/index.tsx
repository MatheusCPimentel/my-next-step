export function BulletList({
  items,
  dotClass,
}: {
  items: readonly string[];
  dotClass: string;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span
            className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`}
          />
          <span className="text-sm text-secondary leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}
