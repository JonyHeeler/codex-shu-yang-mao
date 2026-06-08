import { HeaderBar } from "@renderer/components/HeaderBar";
import { QuotaPanel } from "@renderer/components/QuotaPanel";
import { UsageGrid } from "@renderer/components/UsageGrid";
import { EventTable } from "@renderer/components/EventTable";
import { StatusRail } from "@renderer/components/StatusRail";
import { useUsageSnapshot } from "@renderer/hooks/useUsageSnapshot";

/** Composes the complete Codex token listener desktop dashboard. */
export const App = (): JSX.Element => {
  const { snapshot, isRefreshing, error, refresh, openCodexHome } = useUsageSnapshot();

  return (
    <main className="app-shell">
      <HeaderBar
        snapshot={snapshot}
        error={error}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        onOpenCodexHome={openCodexHome}
      />
      {snapshot ? (
        <div className="dashboard">
          <div className="dashboard__main">
            <QuotaPanel quota={snapshot.quota} />
            <UsageGrid snapshot={snapshot} />
            <EventTable events={snapshot.recentEvents} />
          </div>
          <StatusRail snapshot={snapshot} />
        </div>
      ) : (
        <section className="loading-panel">正在加载</section>
      )}
    </main>
  );
};
