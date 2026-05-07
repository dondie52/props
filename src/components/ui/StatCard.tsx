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
    <Card className="flex flex-col justify-between">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <p className="text-sm font-medium text-text-sub">
            {title}
          </p>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-text-main">{value}</p>
      </div>
      {trend ? (
        <div className="mt-4 flex items-center gap-1">
          <span className={`text-sm font-medium ${trendUp ? "text-success" : "text-error"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
          <span className="text-xs text-text-muted">vs last month</span>
        </div>
      ) : null}
    </Card>
  );
}
