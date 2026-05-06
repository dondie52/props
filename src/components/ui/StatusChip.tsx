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
  paid: "bg-green-100 text-green-700",
  occupied: "bg-green-100 text-green-700",
  active: "bg-green-100 text-green-700",
  resolved: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  expiring: "bg-amber-100 text-amber-700",
  "in-progress": "bg-amber-100 text-amber-700",
  medium: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-error",
  open: "bg-red-100 text-error",
  high: "bg-red-100 text-error",
  vacant: "bg-bg-page text-text-sub",
  low: "bg-bg-page text-text-sub",
};

export default function StatusChip({ status }: StatusChipProps) {
  return (
    <span
      className={`inline-flex rounded-pill px-3 py-1 text-xs font-semibold capitalize ${toneMap[status]}`}
    >
      {status.replace("-", " ")}
    </span>
  );
}
