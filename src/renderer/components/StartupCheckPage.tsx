import { ArrowRight, CheckCircle2, FolderOpen, RefreshCw, XCircle } from "lucide-react";
import type { StartupCheckStep, UsageSnapshot } from "@shared/tokenTypes";
import { formatDateTime } from "@renderer/utils/formatters";

interface StartupCheckPageProps {
  snapshot: UsageSnapshot;
  isRefreshing: boolean;
  onContinue: () => void;
  onRefresh: () => Promise<void>;
  onOpenCodexHome: () => Promise<void>;
}

/** Shows first-launch diagnostics for local Codex data compatibility. */
export const StartupCheckPage = ({
  snapshot,
  isRefreshing,
  onContinue,
  onRefresh,
  onOpenCodexHome
}: StartupCheckPageProps): JSX.Element => {
  const selfCheck = snapshot.selfCheck;
  const allPassed = selfCheck?.steps.every((step) => step.status === "pass") ?? false;

  return (
    <main className="startup-shell">
      <section className="startup-panel">
        <div className="startup-panel__header">
          <div>
            <span className="eyebrow">首次启动自检</span>
            <h1>{allPassed ? "已找到 Codex token 数据" : "正在确认本机数据源"}</h1>
          </div>
          <span className={allPassed ? "startup-badge startup-badge--pass" : "startup-badge"}>
            {allPassed ? "可用" : "待确认"}
          </span>
        </div>

        <div className="startup-checks">
          {selfCheck ? (
            selfCheck.steps.map((step) => <StartupCheckRow key={step.id} step={step} />)
          ) : (
            <div className="startup-check-row">正在检测</div>
          )}
        </div>

        <div className="startup-summary">
          <span>数据目录</span>
          <strong>{snapshot.codexHome}</strong>
          <span>检测时间</span>
          <strong>{formatDateTime(selfCheck?.checkedAtMs)}</strong>
        </div>

        <div className="startup-actions">
          <button type="button" title="打开 Codex 数据目录" onClick={onOpenCodexHome}>
            <FolderOpen size={18} aria-hidden />
          </button>
          <button type="button" title="重新检测" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={isRefreshing ? "spin" : ""} size={18} aria-hidden />
          </button>
          <button className="startup-continue" type="button" onClick={onContinue}>
            <span>进入监控窗口</span>
            <ArrowRight size={18} aria-hidden />
          </button>
        </div>
      </section>
    </main>
  );
};

interface StartupCheckRowProps {
  step: StartupCheckStep;
}

/** Renders one local startup compatibility check. */
export const StartupCheckRow = ({ step }: StartupCheckRowProps): JSX.Element => {
  const Icon = step.status === "pass" ? CheckCircle2 : XCircle;

  return (
    <div className={`startup-check-row startup-check-row--${step.status}`}>
      <Icon size={22} aria-hidden />
      <div>
        <strong>{step.label}</strong>
        <span>{step.detail}</span>
      </div>
    </div>
  );
};
