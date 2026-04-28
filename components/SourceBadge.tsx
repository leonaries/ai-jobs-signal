import { clsx } from "clsx";
import { sourceLabels, type SourceType } from "@/types/signal";

type SourceBadgeProps = {
  sourceType: SourceType;
};

export function SourceBadge({ sourceType }: SourceBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex h-7 items-center border px-2.5 text-xs font-medium",
        sourceType === "xiaohongshu" && "border-signal/30 bg-signal/10 text-signal",
        sourceType === "website" && "border-steel/30 bg-steel/10 text-steel",
        sourceType === "wechat" && "border-moss/30 bg-moss/10 text-moss",
        sourceType === "community" && "border-ink/20 bg-ink/5 text-ink/70"
      )}
    >
      {sourceLabels[sourceType]}
    </span>
  );
}
