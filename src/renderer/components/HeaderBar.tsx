import { Database, FolderOpen, RefreshCw } from "lucide-react";
import type { UsageSnapshot } from "@shared/tokenTypes";
import { formatFreshness } from "@renderer/utils/formatters";

interface HeaderBarProps {
  snapshot: UsageSnapshot | null;
  error: string | null;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  onOpenCodexHome: () => Promise<void>;
}

/** Renders the window header, live status, and primary toolbar actions. */
export const HeaderBar = ({
  snapshot,
  error,
  isRefreshing,
  onRefresh,
  onOpenCodexHome
}: HeaderBarProps): JSX.Element => {
  const now = Date.now();
  const isReady = snapshot?.sourceStatus === "ready" && !error;
  const status = error ?? snapshot?.statusMessage ?? "初始化中";

  return (
    <header className="header-bar">
      <div className="header-bar__title">
        <Database size={24} aria-hidden />
        <div>
          <h1>Codex 数羊毛</h1>
          <span>{isReady ? formatFreshness(snapshot.latestEventAtMs, now) : status}</span>
        </div>
      </div>
      <div className="header-bar__actions">
        <span className={`status-pill ${isReady ? "status-pill--live" : "status-pill--idle"}`}>
          {isReady ? "监听中" : status}
        </span>
        <button type="button" title="打开 Codex 数据目录" onClick={onOpenCodexHome}>
          <FolderOpen size={18} aria-hidden />
        </button>
        <button type="button" title="刷新" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={isRefreshing ? "spin" : ""} size={18} aria-hidden />
        </button>
      </div>
    </header>
  );
};
