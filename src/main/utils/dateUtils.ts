/** Returns the current Unix epoch in milliseconds. */
export const nowMs = (): number => Date.now();

/** Converts a Unix seconds value into milliseconds when present. */
export const secondsToMs = (value: unknown): number | null => {
  return typeof value === "number" && Number.isFinite(value) ? value * 1000 : null;
};

/** Clamps a percentage into the displayable 0-100 range. */
export const clampPercent = (value: number): number => Math.max(0, Math.min(100, value));

/** Parses an ISO timestamp into milliseconds, returning null on invalid input. */
export const parseIsoMs = (value: unknown): number | null => {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
};
