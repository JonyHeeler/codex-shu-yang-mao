/** Formats a token count with compact thousands separators. */
export const formatTokens = (value: number | null | undefined): string => {
  return typeof value === "number" ? value.toLocaleString("zh-CN") : "-";
};

/** Formats a percentage value for quota display. */
export const formatPercent = (value: number | null | undefined): string => {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "-";
};

/** Formats a timestamp using the current local timezone. */
export const formatDateTime = (value: number | null | undefined): string => {
  return typeof value === "number"
    ? new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(value)
    : "-";
};

/** Formats a rolling window duration into a compact Chinese label. */
export const formatWindow = (minutes: number | null | undefined): string => {
  if (typeof minutes !== "number") {
    return "-";
  }

  if (minutes < 60) {
    return `${minutes}分钟`;
  }

  if (minutes < 1440) {
    return `${Math.round(minutes / 60)}小时`;
  }

  return `${Math.round(minutes / 1440)}天`;
};

/** Formats a status timestamp as a short relative freshness label. */
export const formatFreshness = (value: number | null | undefined, now: number): string => {
  if (typeof value !== "number") {
    return "暂无事件";
  }

  const seconds = Math.max(0, Math.round((now - value) / 1000));
  if (seconds < 60) {
    return `${seconds}秒前`;
  }

  const minutes = Math.round(seconds / 60);
  return minutes < 60 ? `${minutes}分钟前` : `${Math.round(minutes / 60)}小时前`;
};
