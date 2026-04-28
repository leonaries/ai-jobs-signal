import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SourceBadge } from "@/components/SourceBadge";
import {
  channelLabels,
  opportunityLabels,
  remoteLabels,
  type Signal
} from "@/types/signal";

type SignalCardProps = {
  signal: Signal;
};

export function SignalCard({ signal }: SignalCardProps) {
  const owner = signal.company_name ?? signal.team_name ?? "未公开团队";

  return (
    <article className="group border-y border-ink/15 bg-paper/80 px-0 py-6 shadow-rule transition-colors hover:bg-white/70">
      <div className="grid gap-5 lg:grid-cols-[1fr_192px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SourceBadge sourceType={signal.source_type} />
            <span className="inline-flex h-7 items-center border border-ink/15 bg-field/80 px-2.5 text-xs font-medium text-ink/70">
              {channelLabels[signal.channel]}
            </span>
            <span className="inline-flex h-7 items-center border border-ink/15 px-2.5 text-xs font-medium text-ink/60">
              {opportunityLabels[signal.opportunity_type]}
            </span>
          </div>

          <Link href={`/signals/${signal.slug}`} className="block">
            <h2 className="max-w-3xl text-2xl font-semibold leading-tight text-ink transition-colors group-hover:text-signal md:text-3xl">
              {signal.title}
            </h2>
          </Link>

          <p className="mt-4 max-w-3xl text-base leading-7 text-ink/72">{signal.summary}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink/58">
            <span className="font-medium text-ink/72">{owner}</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {signal.city ?? "地点未说明"} · {remoteLabels[signal.remote_type]}
            </span>
            {signal.published_at ? (
              <time dateTime={signal.published_at}>
                {new Intl.DateTimeFormat("zh-CN", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit"
                }).format(new Date(signal.published_at))}
              </time>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {signal.skill_tags.slice(0, 6).map((tag) => (
              <span
                key={tag.name}
                className="border border-ink/12 bg-white/55 px-2.5 py-1 text-xs font-medium text-ink/68"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 lg:items-end">
          <div className="grid grid-cols-2 gap-2 lg:w-full">
            <ScoreBadge label="AI Native" value={signal.ai_native_score} />
            <ScoreBadge label="可信度" value={signal.confidence_score} tone="steel" />
          </div>
          <div className="flex gap-2">
            <a
              href={signal.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 border border-ink/20 px-3 text-sm font-medium text-ink/68 transition-colors hover:border-signal hover:text-signal"
            >
              原文
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link
              href={`/signals/${signal.slug}`}
              className="inline-flex h-10 items-center border border-ink bg-ink px-3 text-sm font-medium text-paper transition-colors hover:bg-signal"
            >
              拆解
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
