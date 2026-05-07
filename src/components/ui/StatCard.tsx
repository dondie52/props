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
    <Card className="flex flex-col justify-between overflow-hidden relative">
      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between">
          <p className="text-sm font-semibold tracking-tight text-text-sub uppercase">
            {title}
          </p>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary shadow-sm ring-1 ring-primary/10">
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold tracking-tight text-text-main">{value}</p>
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-2 -bottom-2 h-24 w-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

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
