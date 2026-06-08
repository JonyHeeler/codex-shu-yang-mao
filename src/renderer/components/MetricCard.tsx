import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: "teal" | "blue" | "amber" | "rose";
}

/** Displays one stable token metric card in the dashboard grid. */
export const MetricCard = ({ title, value, detail, icon, tone }: MetricCardProps): JSX.Element => {
  return (
    <section className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__top">
        <span>{title}</span>
        <div className="metric-card__icon">{icon}</div>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </section>
  );
};
