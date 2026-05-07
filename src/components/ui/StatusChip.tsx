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
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  occupied: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  pending: "bg-amber-50 text-amber-700 border-amber-200/60",
  expiring: "bg-amber-50 text-amber-700 border-amber-200/60",
  "in-progress": "bg-amber-50 text-amber-700 border-amber-200/60",
  medium: "bg-amber-50 text-amber-700 border-amber-200/60",
  overdue: "bg-rose-50 text-rose-700 border-rose-200/60",
  open: "bg-rose-50 text-rose-700 border-rose-200/60",
  high: "bg-rose-50 text-rose-700 border-rose-200/60",
  vacant: "bg-slate-50 text-slate-600 border-slate-200/60",
  low: "bg-slate-50 text-slate-600 border-slate-200/60",
};

export default function StatusChip({ status }: StatusChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${toneMap[status]}`}
    >
      {status.replace("-", " ")}
    </span>
  );
}
