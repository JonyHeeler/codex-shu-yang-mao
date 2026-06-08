import type {
  RecentEventSnapshot,
  TokenEvent,
  TokenUsage,
  UsageSnapshot,
  UsageWindowSnapshot
} from "@shared/tokenTypes";
import { safeBaseName } from "../utils/pathUtils";

const emptyUsage = (): TokenUsage => ({
  inputTokens: 0,
  cachedInputTokens: 0,
  outputTokens: 0,
  reasoningOutputTokens: 0,
  totalTokens: 0
});

/** Maintains rolling token statistics from parsed Codex token events. */
export class UsageAggregator {
  private readonly events = new Map<string, TokenEvent>();

  /** Adds parsed token events while preserving deterministic IDs. */
  absorb(events: TokenEvent[]): void {
    for (const event of events) {
      this.events.set(event.id, event);
    }
  }

  /** Builds the complete renderer snapshot for the requested point in time. */
  createSnapshot(codexHome: string, generatedAtMs: number): UsageSnapshot {
    this.dropOlderThan(generatedAtMs - 35 * 24 * 60 * 60 * 1000);
    const ordered = [...this.events.values()].sort((a, b) => b.timestampMs - a.timestampMs);
    const latest = ordered[0] ?? null;
    const latestQuota = ordered.find((event) => event.rateLimits)?.rateLimits ?? null;

    return {
      generatedAtMs,
      codexHome,
      sourceStatus: ordered.length > 0 ? "ready" : "missing",
      statusMessage: ordered.length > 0 ? "监听中" : "未发现 token_count 事件",
      eventCount: ordered.length,
      latestEventAtMs: latest?.timestampMs ?? null,
      latestSessionTotal: latest?.totalUsage ?? null,
      quota: latestQuota,
      windows: {
        hour: this.window("最近1小时", 60, generatedAtMs, ordered),
        day: this.window("最近24小时", 1440, generatedAtMs, ordered),
        month: this.window("最近30天", 43200, generatedAtMs, ordered)
      },
      recentEvents: ordered.slice(0, 8).map((event) => this.toRecentEvent(event))
    };
  }

  private window(
    label: string,
    minutes: number,
    now: number,
    events: TokenEvent[]
  ): UsageWindowSnapshot {
    const cutoff = now - minutes * 60 * 1000;
    const scoped = events.filter((event) => event.timestampMs >= cutoff);
    return {
      label,
      minutes,
      usage: scoped.reduce((total, event) => this.addUsage(total, event.usage), emptyUsage()),
      eventCount: scoped.length
    };
  }

  private addUsage(total: TokenUsage, next: TokenUsage): TokenUsage {
    return {
      inputTokens: total.inputTokens + next.inputTokens,
      cachedInputTokens: total.cachedInputTokens + next.cachedInputTokens,
      outputTokens: total.outputTokens + next.outputTokens,
      reasoningOutputTokens: total.reasoningOutputTokens + next.reasoningOutputTokens,
      totalTokens: total.totalTokens + next.totalTokens
    };
  }

  private toRecentEvent(event: TokenEvent): RecentEventSnapshot {
    return {
      id: event.id,
      timestampMs: event.timestampMs,
      totalTokens: event.usage.totalTokens,
      inputTokens: event.usage.inputTokens,
      outputTokens: event.usage.outputTokens,
      sourceName: safeBaseName(event.sourceFile)
    };
  }

  private dropOlderThan(cutoffMs: number): void {
    for (const [id, event] of this.events) {
      if (event.timestampMs < cutoffMs) {
        this.events.delete(id);
      }
    }
  }
}
