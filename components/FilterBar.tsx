import Link from "next/link";
import type { Route } from "next";
import { clsx } from "clsx";
import {
  channelLabels,
  sourceLabels,
  type SignalChannel,
  type SourceType
} from "@/types/signal";

const channels: Array<{ value?: SignalChannel; label: string }> = [
  { label: "全部" },
  { value: "ai_fullstack", label: channelLabels.ai_fullstack },
  { value: "agent", label: channelLabels.agent },
  { value: "rag", label: channelLabels.rag },
  { value: "ai_ide", label: channelLabels.ai_ide },
  { value: "multimodal", label: channelLabels.multimodal },
  { value: "remote", label: channelLabels.remote },
  { value: "early_team", label: channelLabels.early_team }
];

const sources: Array<{ value?: SourceType; label: string }> = [
  { label: "全部来源" },
  { value: "xiaohongshu", label: sourceLabels.xiaohongshu },
  { value: "website", label: sourceLabels.website },
  { value: "wechat", label: sourceLabels.wechat },
  { value: "community", label: sourceLabels.community }
];

type FilterBarProps = {
  activeChannel?: SignalChannel;
  activeSource?: SourceType;
};

export function FilterBar({ activeChannel, activeSource }: FilterBarProps) {
  return (
    <div className="space-y-3 border-y border-ink/15 bg-paper/70 py-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {channels.map((channel) => (
          <FilterLink
            key={channel.value ?? "all"}
            href={buildHref(channel.value, activeSource)}
            active={activeChannel === channel.value || (!activeChannel && !channel.value)}
          >
            {channel.label}
          </FilterLink>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sources.map((source) => (
          <FilterLink
            key={source.value ?? "all-sources"}
            href={buildHref(activeChannel, source.value)}
            active={activeSource === source.value || (!activeSource && !source.value)}
            quiet
          >
            {source.label}
          </FilterLink>
        ))}
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  quiet,
  children
}: {
  href: Route;
  active: boolean;
  quiet?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex h-9 shrink-0 items-center border px-3 text-sm font-medium transition-colors",
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/15 bg-white/45 text-ink/66 hover:border-signal hover:text-signal",
        quiet && active && "border-steel bg-steel"
      )}
    >
      {children}
    </Link>
  );
}

function buildHref(channel?: SignalChannel, source?: SourceType) {
  const params = new URLSearchParams();
  if (channel) {
    params.set("channel", channel);
  }
  if (source) {
    params.set("source", source);
  }
  const query = params.toString();
  return (query ? `/?${query}` : "/") as Route;
}
