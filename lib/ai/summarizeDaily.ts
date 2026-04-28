import type { Signal, SignalChannel, SkillTag } from "@/types/signal";

export function summarizeDaily(signals: Signal[]) {
  const hotTags = getHotTagsFromSignals(signals);
  const risingChannels = getTopChannels(signals);

  const summary =
    signals.length === 0
      ? "今天还没有足够的新信号形成稳定判断。系统会继续观察公开来源中的 AI 开发机会。"
      : `今天共发布 ${signals.length} 条 AI 开发机会信号。高频技能集中在 ${hotTags
          .slice(0, 3)
          .map((tag) => tag.name)
          .join("、")}，主要方向包括 ${risingChannels.join("、")}。`;

  return {
    title: "今日 AI 开发机会观察",
    summary,
    hot_tags: hotTags,
    rising_channels: risingChannels,
    published_signal_count: signals.length
  };
}

function getHotTagsFromSignals(signals: Signal[]) {
  const scores = new Map<string, number>();
  for (const signal of signals) {
    for (const tag of signal.skill_tags) {
      scores.set(tag.name, (scores.get(tag.name) ?? 0) + (tag.weight ?? 1));
    }
  }

  return [...scores.entries()]
    .map(([name, weight]) => ({ name, weight }) satisfies SkillTag)
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
    .slice(0, 10);
}

function getTopChannels(signals: Signal[]) {
  const scores = new Map<SignalChannel, number>();
  for (const signal of signals) {
    scores.set(signal.channel, (scores.get(signal.channel) ?? 0) + 1);
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([channel]) => channel);
}
