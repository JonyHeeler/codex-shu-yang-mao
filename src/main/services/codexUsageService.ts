import type { UsageSnapshot } from "@shared/tokenTypes";
import { nowMs } from "../utils/dateUtils";
import { SessionFileFinder } from "./sessionFileFinder";
import { SessionLogScanner } from "./sessionLogScanner";
import { StartupSelfCheck } from "./startupSelfCheck";
import { UsageAggregator } from "./usageAggregator";

type SnapshotListener = (snapshot: UsageSnapshot) => void;

/** Coordinates Codex file scanning, rolling aggregation, and UI updates. */
export class CodexUsageService {
  private readonly scanner: SessionLogScanner;
  private readonly selfCheckRunner: StartupSelfCheck;
  private readonly aggregator = new UsageAggregator();
  private timer: NodeJS.Timeout | null = null;
  private latest: UsageSnapshot | null = null;
  private latestSelfCheck: UsageSnapshot["selfCheck"] = null;
  private refreshInFlight: Promise<UsageSnapshot> | null = null;

  /** Creates a service for a Codex home path and refresh interval. */
  constructor(
    private readonly codexHome: string,
    private readonly intervalMs = 2500
  ) {
    this.scanner = new SessionLogScanner(new SessionFileFinder(codexHome));
    this.selfCheckRunner = new StartupSelfCheck(codexHome);
  }

  /** Starts periodic refreshes and emits a snapshot after each scan. */
  async start(listener: SnapshotListener): Promise<void> {
    await this.refresh();
    listener(this.getSnapshot());
    this.timer = setInterval(async () => {
      const snapshot = await this.refresh();
      listener(snapshot);
    }, this.intervalMs);
  }

  /** Stops the background refresh timer. */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Forces one scan and returns the latest safe-to-render snapshot. */
  async refresh(): Promise<UsageSnapshot> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    this.refreshInFlight = this.performRefresh().finally(() => {
      this.refreshInFlight = null;
    });
    return this.refreshInFlight;
  }

  private async performRefresh(): Promise<UsageSnapshot> {
    const generatedAt = nowMs();
    const cutoff = generatedAt - 35 * 24 * 60 * 60 * 1000;

    try {
      const events = await this.scanner.scan(cutoff);
      this.aggregator.absorb(events);
      this.latestSelfCheck = await this.getSelfCheck(generatedAt, events);
      this.latest = this.aggregator.createSnapshot(
        this.codexHome,
        generatedAt,
        this.latestSelfCheck
      );
    } catch (error) {
      this.latest = this.errorSnapshot(generatedAt, error);
    }

    return this.latest;
  }

  /** Returns the latest known snapshot or creates an empty one. */
  getSnapshot(): UsageSnapshot {
    return (
      this.latest ??
      this.aggregator.createSnapshot(this.codexHome, nowMs(), this.latestSelfCheck)
    );
  }

  private async getSelfCheck(
    generatedAtMs: number,
    events: { sourceFile: string }[]
  ): Promise<UsageSnapshot["selfCheck"]> {
    const shouldRun =
      !this.latestSelfCheck ||
      (!this.latestSelfCheck.tokenCountFound &&
        (events.length > 0 || generatedAtMs - this.latestSelfCheck.checkedAtMs > 30000));

    if (shouldRun) {
      const eventFileCount = new Set(events.map((event) => event.sourceFile)).size;
      this.latestSelfCheck = await this.selfCheckRunner.run(events.length, eventFileCount);
    }

    return this.latestSelfCheck;
  }

  private errorSnapshot(generatedAtMs: number, error: unknown): UsageSnapshot {
    const message = error instanceof Error ? error.message : "未知错误";
    return {
      ...this.aggregator.createSnapshot(this.codexHome, generatedAtMs, this.latestSelfCheck),
      sourceStatus: "error",
      statusMessage: message
    };
  }
}
