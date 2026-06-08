import { Gauge, TimerReset } from "lucide-react";
import type { RateLimitSnapshot, RateLimitWindowSnapshot } from "@shared/tokenTypes";
import { formatDateTime, formatPercent, formatWindow } from "@renderer/utils/formatters";

interface QuotaPanelProps {
  quota: RateLimitSnapshot | null;
}

const windowProgress = (window: RateLimitWindowSnapshot | null): number => {
  return Math.max(0, Math.min(100, window?.remainingPercent ?? 0));
};

/** Shows current Codex account quota signals from the latest rate-limit event. */
export const QuotaPanel = ({ quota }: QuotaPanelProps): JSX.Element => {
  const primary = quota?.primary ?? null;
  const secondary = quota?.secondary ?? null;

  return (
    <section className="quota-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">当前账号额度</span>
          <h2>{formatPercent(primary?.remainingPercent)} 剩余</h2>
        </div>
        <Gauge size={28} aria-hidden />
      </div>
      <div className="quota-meter">
        <div style={{ width: `${windowProgress(primary)}%` }} />
      </div>
      <div className="quota-meta">
        <span>已用 {formatPercent(primary?.usedPercent)}</span>
        <span>窗口 {formatWindow(primary?.windowMinutes)}</span>
        <span>套餐 {quota?.planType ?? "-"}</span>
      </div>
      <div className="quota-windows">
        <QuotaWindow title="主窗口" window={primary} />
        <QuotaWindow title="次窗口" window={secondary} />
      </div>
    </section>
  );
};

interface QuotaWindowProps {
  title: string;
  window: RateLimitWindowSnapshot | null;
}

/** Renders one compact rate-limit window row. */
export const QuotaWindow = ({ title, window }: QuotaWindowProps): JSX.Element => {
  return (
    <div className="quota-window">
      <div>
        <span>{title}</span>
        <strong>{formatPercent(window?.remainingPercent)}</strong>
      </div>
      <div>
        <TimerReset size={16} aria-hidden />
        <span>{formatDateTime(window?.resetsAtMs)}</span>
      </div>
    </div>
  );
};
