import { clsx } from "clsx";

type ScoreBadgeProps = {
  label: string;
  value: number;
  tone?: "signal" | "steel" | "moss";
};

export function ScoreBadge({ label, value, tone = "signal" }: ScoreBadgeProps) {
  return (
    <div className="min-w-[86px] border border-ink/15 bg-paper/70 px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.08em] text-ink/55">{label}</div>
      <div
        className={clsx("mt-1 text-2xl font-semibold leading-none", {
          "text-signal": tone === "signal",
          "text-steel": tone === "steel",
          "text-moss": tone === "moss"
        })}
      >
        {value}
      </div>
    </div>
  );
}
