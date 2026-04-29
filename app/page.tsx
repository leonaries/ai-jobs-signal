import { DailySummary } from "@/components/DailySummary";
import { FilterBar } from "@/components/FilterBar";
import { HotTags } from "@/components/HotTags";
import { SignalCard } from "@/components/SignalCard";
import { getLatestDailyReport } from "@/lib/data/reports";
import { getHotTags, getPublishedSignals } from "@/lib/data/signals";
import type { SignalChannel, SourceType } from "@/types/signal";

type HomePageProps = {
  searchParams: Promise<{
    channel?: SignalChannel;
    source?: SourceType;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const [report, signals, hotTags] = await Promise.all([
    getLatestDailyReport(),
    getPublishedSignals({
      channel: params.channel,
      sourceType: params.source
    }),
    getHotTags()
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-5 md:px-8 md:py-8">
      <header className="mb-5 flex flex-col justify-between gap-4 border-b border-ink/15 pb-5 md:flex-row md:items-end">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">
            AI Jobs Signal
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/58">
            从公开信源里发现全球 AI 开发岗位、早期团队、远程协作和技能趋势。
          </p>
        </div>
        <div className="text-left text-xs uppercase tracking-[0.16em] text-ink/45 md:text-right">
          Public Signals · No BOSS Data
        </div>
      </header>

      <DailySummary report={report} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <FilterBar activeChannel={params.channel} activeSource={params.source} />

          <div className="mt-3">
            {signals.length > 0 ? (
              signals.map((signal) => <SignalCard key={signal.id} signal={signal} />)
            ) : (
              <div className="border border-ink/15 bg-white/50 p-10 text-center">
                <h2 className="text-xl font-semibold text-ink">暂时没有匹配信号</h2>
                <p className="mt-2 text-sm text-ink/58">换一个频道或来源筛选试试。</p>
              </div>
            )}
          </div>
        </section>

        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <HotTags tags={hotTags} />
          <aside className="border border-ink/15 bg-white/50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/60">
              Source Policy
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink/62">
              当前版本只展示公开来源的摘要和外链。小红书内容按机会线索处理，不采评论、私信或登录后内容。
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
