/** Raw token usage counters reported by Codex token_count events. */
export interface TokenUsage {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningOutputTokens: number;
  totalTokens: number;
}

/** One Codex rate-limit window as exposed by local session events. */
export interface RateLimitWindowSnapshot {
  usedPercent: number | null;
  remainingPercent: number | null;
  windowMinutes: number | null;
  resetsAtMs: number | null;
}

/** Latest account quota signal extracted from Codex rate-limit data. */
export interface RateLimitSnapshot {
  limitId: string | null;
  planType: string | null;
  reachedType: string | null;
  primary: RateLimitWindowSnapshot | null;
  secondary: RateLimitWindowSnapshot | null;
  credits: unknown;
  capturedAtMs: number | null;
}

/** A token event with only usage metadata, never prompt or response text. */
export interface TokenEvent {
  id: string;
  timestampMs: number;
  usage: TokenUsage;
  totalUsage: TokenUsage;
  modelContextWindow: number | null;
  rateLimits: RateLimitSnapshot | null;
  sourceFile: string;
}

/** Aggregated usage for a rolling time window. */
export interface UsageWindowSnapshot {
  label: string;
  minutes: number;
  usage: TokenUsage;
  eventCount: number;
}

/** Small display-safe event row for the renderer. */
export interface RecentEventSnapshot {
  id: string;
  timestampMs: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  sourceName: string;
}

/** One startup self-check result shown before the dashboard opens. */
export interface StartupCheckStep {
  id: "codexHome" | "sessions" | "tokenCount";
  label: string;
  status: "pass" | "fail";
  detail: string;
}

/** Startup diagnostics for local Codex data compatibility. */
export interface StartupSelfCheckSnapshot {
  checkedAtMs: number;
  codexHome: string;
  sessionsRoot: string;
  codexHomeExists: boolean;
  sessionsDirectoryExists: boolean;
  sessionFileCount: number;
  tokenCountFound: boolean;
  tokenCountFileCount: number;
  tokenCountEventCount: number;
  steps: StartupCheckStep[];
}

/** Full snapshot sent from Electron main to the desktop UI. */
export interface UsageSnapshot {
  generatedAtMs: number;
  codexHome: string;
  selfCheck: StartupSelfCheckSnapshot | null;
  sourceStatus: "ready" | "missing" | "error";
  statusMessage: string;
  eventCount: number;
  latestEventAtMs: number | null;
  latestSessionTotal: TokenUsage | null;
  quota: RateLimitSnapshot | null;
  windows: {
    hour: UsageWindowSnapshot;
    day: UsageWindowSnapshot;
    month: UsageWindowSnapshot;
  };
  recentEvents: RecentEventSnapshot[];
}

/** Renderer-side API exposed by Electron preload. */
export interface TokenMonitorBridge {
  getSnapshot: () => Promise<UsageSnapshot>;
  refresh: () => Promise<UsageSnapshot>;
  openCodexHome: () => Promise<boolean>;
  onSnapshot: (listener: (snapshot: UsageSnapshot) => void) => () => void;
}
