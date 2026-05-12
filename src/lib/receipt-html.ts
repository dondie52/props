function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ReceiptPayload = {
  tenantName: string;
  propertyName: string;
  unitLabel: string;
  amountFormatted: string;
  dueDate: string;
  paidDate: string;
  method: string;
  status: string;
  receiptNo: string;
};

export function buildReceiptHtml(data: ReceiptPayload): string {
  const rows: [string, string][] = [
    ["Tenant", data.tenantName],
    ["Property", data.propertyName],
    ["Unit", data.unitLabel],
    ["Amount", data.amountFormatted],
    ["Due", data.dueDate],
    ["Paid", data.paidDate],
    ["Method", data.method],
    ["Status", data.status],
    ["Receipt #", data.receiptNo],
  ];
  const bodyRows = rows
    .map(
      ([k, v]) =>
        `<tr><th style="text-align:left;padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;width:140px">${escapeHtml(k)}</th><td style="padding:8px 12px;border:1px solid #e5e7eb">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Rent receipt — ${escapeHtml(data.receiptNo)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 24px auto; padding: 0 16px; color: #111827; }
    h1 { font-size: 1.25rem; margin: 0 0 8px; }
    p.sub { margin: 0 0 24px; color: #6b7280; font-size: 0.875rem; }
    table { border-collapse: collapse; width: 100%; font-size: 0.875rem; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>PropManage BW — Payment receipt</h1>
  <p class="sub">This document was generated from your account. Print or save as PDF from your browser if needed.</p>
  <table>${bodyRows}</table>
</body>
</html>`;
}
