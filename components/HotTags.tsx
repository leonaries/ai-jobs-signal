import type { SkillTag } from "@/types/signal";

type HotTagsProps = {
  tags: SkillTag[];
};

export function HotTags({ tags }: HotTagsProps) {
  return (
    <aside className="border border-ink/15 bg-field/80 p-5">
      <div className="mb-5 flex items-end justify-between border-b border-ink/15 pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/60">Hot Skills</h2>
        <span className="text-xs text-ink/45">7d</span>
      </div>
      <div className="space-y-3">
        {tags.map((tag, index) => (
          <div key={tag.name} className="grid grid-cols-[24px_1fr_auto] items-center gap-3">
            <span className="text-xs font-semibold text-ink/38">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-sm font-medium text-ink/78">{tag.name}</span>
            <span className="h-2 w-14 bg-ink/10">
              <span
                className="block h-2 bg-signal"
                style={{ width: `${Math.max(22, Math.min(100, (tag.weight ?? 0.5) * 100))}%` }}
              />
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
