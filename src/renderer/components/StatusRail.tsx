import { Cpu, HardDrive, Radio } from "lucide-react";
import type { UsageSnapshot } from "@shared/tokenTypes";
import { formatDateTime, formatTokens } from "@renderer/utils/formatters";

interface StatusRailProps {
  snapshot: UsageSnapshot;
}

/** Shows source and parsing status beside the primary dashboard content. */
export const StatusRail = ({ snapshot }: StatusRailProps): JSX.Element => {
  return (
    <aside className="status-rail">
      <div className="section-title">
        <h2>监听状态</h2>
        <span>{snapshot.sourceStatus}</span>
      </div>
      <RailItem icon={<Radio size={18} />} label="事件数" value={formatTokens(snapshot.eventCount)} />
      <RailItem icon={<Cpu size={18} />} label="最新事件" value={formatDateTime(snapshot.latestEventAtMs)} />
      <RailItem icon={<HardDrive size={18} />} label="数据目录" value={snapshot.codexHome} />
    </aside>
  );
};

interface RailItemProps {
  icon: JSX.Element;
  label: string;
  value: string;
}

/** Renders one status item in the right rail. */
export const RailItem = ({ icon, label, value }: RailItemProps): JSX.Element => {
  return (
    <div className="rail-item">
      <div className="rail-item__icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
};
