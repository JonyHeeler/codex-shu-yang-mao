import type {
  RateLimitSnapshot,
  RateLimitWindowSnapshot,
  TokenUsage
} from "@shared/tokenTypes";
import { clampPercent, secondsToMs } from "../utils/dateUtils";

type RawUsage = Record<string, unknown> | null | undefined;
type RawRateLimit = Record<string, unknown> | null | undefined;

const numberValue = (value: unknown): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

/** Converts Codex snake_case token counters into renderer-safe usage data. */
export const normalizeUsage = (raw: RawUsage): TokenUsage => ({
  inputTokens: numberValue(raw?.input_tokens),
  cachedInputTokens: numberValue(raw?.cached_input_tokens),
  outputTokens: numberValue(raw?.output_tokens),
  reasoningOutputTokens: numberValue(raw?.reasoning_output_tokens),
  totalTokens: numberValue(raw?.total_tokens)
});

/** Converts one Codex rate-limit window into display-ready quota metadata. */
export const normalizeWindow = (raw: RawRateLimit): RateLimitWindowSnapshot | null => {
  if (!raw) {
    return null;
  }

  const used = typeof raw.used_percent === "number" ? clampPercent(raw.used_percent) : null;
  return {
    usedPercent: used,
    remainingPercent: used === null ? null : clampPercent(100 - used),
    windowMinutes: typeof raw.window_minutes === "number" ? raw.window_minutes : null,
    resetsAtMs: secondsToMs(raw.resets_at)
  };
};

/** Converts Codex rate-limit payloads into a stable snapshot shape. */
export const normalizeRateLimits = (
  raw: RawRateLimit,
  capturedAtMs: number
): RateLimitSnapshot | null => {
  if (!raw) {
    return null;
  }

  return {
    limitId: typeof raw.limit_id === "string" ? raw.limit_id : null,
    planType: typeof raw.plan_type === "string" ? raw.plan_type : null,
    reachedType:
      typeof raw.rate_limit_reached_type === "string" ? raw.rate_limit_reached_type : null,
    primary: normalizeWindow(raw.primary as RawRateLimit),
    secondary: normalizeWindow(raw.secondary as RawRateLimit),
    credits: raw.credits ?? null,
    capturedAtMs
  };
};
