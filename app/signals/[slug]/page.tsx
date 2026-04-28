import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SourceBadge } from "@/components/SourceBadge";
import { getSignalBySlug } from "@/lib/data/signals";
import { channelLabels, opportunityLabels, remoteLabels } from "@/types/signal";

type SignalDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SignalDetailPage({ params }: SignalDetailPageProps) {
  const { slug } = await params;
  const signal = await getSignalBySlug(slug);

  if (!signal) {
    notFound();
  }

  const owner = signal.company_name ?? signal.team_name ?? "未公开团队";

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-signal"
      >
        <ArrowLeft className="h-4 w-4" />
        返回信号流
      </Link>

      <article className="border border-ink/15 bg-paper/85 p-5 shadow-panel md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <SourceBadge sourceType={signal.source_type} />
          <span className="inline-flex h-7 items-center border border-ink/15 bg-field/80 px-2.5 text-xs font-medium text-ink/70">
            {channelLabels[signal.channel]}
          </span>
          <span className="inline-flex h-7 items-center border border-ink/15 px-2.5 text-xs font-medium text-ink/60">
            {opportunityLabels[signal.opportunity_type]}
          </span>
        </div>

        <h1 className="mt-6 max-w-4xl font-display text-4xl leading-tight text-ink md:text-6xl">
          {signal.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink/58">
          <span className="font-medium text-ink/74">{owner}</span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {signal.city ?? "地点未说明"} · {remoteLabels[signal.remote_type]}
          </span>
          {signal.published_at ? (
            <time dateTime={signal.published_at}>
              {new Intl.DateTimeFormat("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              }).format(new Date(signal.published_at))}
            </time>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_220px]">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-signal">
              Signal Readout
            </h2>
            <p className="mt-4 text-lg leading-8 text-ink/76">{signal.summary}</p>

            <h2 className="mt-10 text-sm font-semibold uppercase tracking-[0.14em] text-ink/48">
              Skill Tags
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {signal.skill_tags.map((tag) => (
                <span
                  key={tag.name}
                  className="border border-ink/12 bg-white/60 px-3 py-1.5 text-sm font-medium text-ink/70"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              <ScoreBadge label="AI Native" value={signal.ai_native_score} />
              <ScoreBadge label="可信度" value={signal.confidence_score} tone="steel" />
            </div>
            <a
              href={signal.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-full items-center justify-center gap-2 border border-ink bg-ink px-3 text-sm font-medium text-paper transition-colors hover:bg-signal"
            >
              查看原始来源
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </aside>
        </div>
      </article>
    </main>
  );
}
