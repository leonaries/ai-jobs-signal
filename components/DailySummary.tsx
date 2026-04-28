import { Activity, Radio } from "lucide-react";
import { channelLabels, type DailyReport } from "@/types/signal";

type DailySummaryProps = {
  report: DailyReport;
};

export function DailySummary({ report }: DailySummaryProps) {
  return (
    <section className="border border-ink bg-ink text-paper shadow-panel">
      <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
        <div className="p-6 md:p-8">
          <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-citron">
            <Radio className="h-4 w-4" />
            Daily Brief · {report.report_date}
          </div>
          <h1 className="max-w-3xl font-display text-4xl leading-none md:text-6xl">
            国内 AI 开发机会信号
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-paper/76">{report.summary}</p>
        </div>
        <div className="border-t border-paper/15 p-6 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2 text-sm font-medium text-paper/70">
            <Activity className="h-4 w-4 text-citron" />
            今日观测
          </div>
          <div className="mt-5 text-6xl font-semibold leading-none text-citron">
            {report.published_signal_count}
          </div>
          <div className="mt-2 text-sm text-paper/54">条公开机会信号</div>
          <div className="mt-6 flex flex-wrap gap-2">
            {report.rising_channels.map((channel) => (
              <span key={channel} className="border border-paper/18 px-2.5 py-1 text-xs text-paper/72">
                {channelLabels[channel]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
