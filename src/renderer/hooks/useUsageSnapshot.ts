import { useCallback, useEffect, useState } from "react";
import type { UsageSnapshot } from "@shared/tokenTypes";

interface UsageSnapshotState {
  snapshot: UsageSnapshot | null;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  openCodexHome: () => Promise<void>;
}

/** Connects the renderer to Electron's live token usage snapshot stream. */
export const useUsageSnapshot = (): UsageSnapshotState => {
  const [snapshot, setSnapshot] = useState<UsageSnapshot | null>(null);
  const [isRefreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setSnapshot(await window.tokenMonitor.refresh());
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "刷新失败");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const openCodexHome = useCallback(async () => {
    await window.tokenMonitor.openCodexHome();
  }, []);

  useEffect(() => {
    void window.tokenMonitor.refresh().then(setSnapshot).catch(() => {
      setError("无法连接本地监听进程");
    });

    return window.tokenMonitor.onSnapshot((next) => {
      setSnapshot(next);
      setError(null);
    });
  }, []);

  return { snapshot, isRefreshing, error, refresh, openCodexHome };
};
