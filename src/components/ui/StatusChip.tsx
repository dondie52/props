type Status =
  | "paid"
  | "pending"
  | "overdue"
  | "occupied"
  | "vacant"
  | "active"
  | "expiring"
  | "open"
  | "in-progress"
  | "resolved"
  | "high"
  | "medium"
  | "low";

type StatusChipProps = {
  status: Status;
};

const toneMap: Record<Status, string> = {
  paid: "bg-success-light text-success-dark border-success/20",
  occupied: "bg-success-light text-success-dark border-success/20",
  active: "bg-success-light text-success-dark border-success/20",
  resolved: "bg-success-light text-success-dark border-success/20",
  pending: "bg-warning-light text-warning-dark border-warning/20",
  expiring: "bg-warning-light text-warning-dark border-warning/20",
  "in-progress": "bg-warning-light text-warning-dark border-warning/20",
  medium: "bg-warning-light text-warning-dark border-warning/20",
  overdue: "bg-error-light text-error-dark border-error/20",
  open: "bg-error-light text-error-dark border-error/20",
  high: "bg-error-light text-error-dark border-error/20",
  vacant: "bg-bg-page text-text-sub border-border-muted",
  low: "bg-bg-page text-text-sub border-border-muted",
};

export default function StatusChip({ status }: StatusChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize transition-colors ${toneMap[status]}`}
    >
      {status.replace("-", " ")}
    </span>
  );
}
