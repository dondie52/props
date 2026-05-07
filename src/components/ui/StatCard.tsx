import { ReactNode } from "react";
import Card from "./Card";

type StatCardProps = {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: ReactNode;
};

export default function StatCard({
  title,
  value,
  trend,
  trendUp = true,
  icon,
}: StatCardProps) {
  return (
    <Card>
      <div className="mb-4 flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {title}
        </p>
        <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-bg-page text-primary-mid">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-primary">{value}</p>
      {trend ? (
        <p className={`mt-2 text-sm ${trendUp ? "text-green-700" : "text-error"}`}>
          {trendUp ? "↑" : "↓"} {trend}
        </p>
      ) : null}
    </Card>
  );
}
