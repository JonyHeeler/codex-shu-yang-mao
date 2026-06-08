import { Activity, CalendarClock, Clock3, History } from "lucide-react";
import type { UsageSnapshot, UsageWindowSnapshot } from "@shared/tokenTypes";
import { formatTokens } from "@renderer/utils/formatters";
import { MetricCard } from "./MetricCard";

interface UsageGridProps {
  snapshot: UsageSnapshot;
}

const detail = (window: UsageWindowSnapshot): string => {
  return `${window.eventCount.toLocaleString("zh-CN")} 次事件`;
};

/** Displays rolling token totals for the requested monitoring windows. */
export const UsageGrid = ({ snapshot }: UsageGridProps): JSX.Element => {
  return (
    <section className="usage-grid">
      <MetricCard
        title="最近1小时"
        value={formatTokens(snapshot.windows.hour.usage.totalTokens)}
        detail={detail(snapshot.windows.hour)}
        icon={<Clock3 size={18} aria-hidden />}
        tone="teal"
      />
      <MetricCard
        title="最近24小时"
        value={formatTokens(snapshot.windows.day.usage.totalTokens)}
        detail={detail(snapshot.windows.day)}
        icon={<Activity size={18} aria-hidden />}
        tone="blue"
      />
      <MetricCard
        title="最近30天"
        value={formatTokens(snapshot.windows.month.usage.totalTokens)}
        detail={detail(snapshot.windows.month)}
        icon={<CalendarClock size={18} aria-hidden />}
        tone="amber"
      />
      <MetricCard
        title="当前会话累计"
        value={formatTokens(snapshot.latestSessionTotal?.totalTokens)}
        detail="最新 token_count"
        icon={<History size={18} aria-hidden />}
        tone="rose"
      />
    </section>
  );
};
