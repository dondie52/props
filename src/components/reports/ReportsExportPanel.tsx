import Link from "next/link";
import { FileDown } from "lucide-react";
import Card from "@/components/ui/Card";

export type ReportExportLinkItem = { href: string; label: string };

export default function ReportsExportPanel({ description, items }: { description: string; items: ReportExportLinkItem[] }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-sm text-text-sub">{description}</p>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-primary">Exports</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex items-center gap-2 rounded-md border border-border-ghost bg-white px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-bg-page"
                download
              >
                <FileDown className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
