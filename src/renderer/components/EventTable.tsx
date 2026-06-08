import type { RecentEventSnapshot } from "@shared/tokenTypes";
import { formatDateTime, formatTokens } from "@renderer/utils/formatters";

interface EventTableProps {
  events: RecentEventSnapshot[];
}

/** Renders recent token_count events without prompt or response content. */
export const EventTable = ({ events }: EventTableProps): JSX.Element => {
  return (
    <section className="event-table">
      <div className="section-title">
        <h2>最近事件</h2>
        <span>{events.length} 条</span>
      </div>
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>总计</th>
              <th>输入</th>
              <th>输出</th>
              <th>来源</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{formatDateTime(event.timestampMs)}</td>
                <td>{formatTokens(event.totalTokens)}</td>
                <td>{formatTokens(event.inputTokens)}</td>
                <td>{formatTokens(event.outputTokens)}</td>
                <td>{event.sourceName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
