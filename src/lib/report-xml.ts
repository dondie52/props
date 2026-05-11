import { escapeXml } from "@/lib/xml-escape";

export type PaymentExportRow = {
  tenant: string;
  property: string;
  unit: string;
  amount: number;
  dueDate: string;
  paymentDate: string;
  method: string;
  status: string;
};

export type TenantExportRow = {
  id: string;
  name: string;
  email: string;
  property: string;
  unit: string;
  rentAmount: number;
  leaseStart: string;
  leaseEnd: string;
  status: string;
};

export type ReportXmlMeta = {
  type: "payments" | "tenants";
  generatedAt: string;
  landlordId: string | null;
};

function el(name: string, value: string | number): string {
  const v = typeof value === "number" ? String(value) : escapeXml(value);
  return `<${name}>${v}</${name}>`;
}

export function buildPaymentsXml(rows: PaymentExportRow[], meta: ReportXmlMeta): string {
  const attrs = [
    `type="${escapeXml(meta.type)}"`,
    `generatedAt="${escapeXml(meta.generatedAt)}"`,
    `landlordId="${escapeXml(meta.landlordId ?? "")}"`,
  ].join(" ");
  const body = rows
    .map(
      (r) =>
        `    <payment>\n` +
        `      ${el("tenant", r.tenant)}\n` +
        `      ${el("property", r.property)}\n` +
        `      ${el("unit", r.unit)}\n` +
        `      ${el("amount", r.amount)}\n` +
        `      ${el("dueDate", r.dueDate)}\n` +
        `      ${el("paymentDate", r.paymentDate)}\n` +
        `      ${el("method", r.method)}\n` +
        `      ${el("status", r.status)}\n` +
        `    </payment>`,
    )
    .join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<PropManageReport ${attrs}>\n` +
    `  <payments>\n` +
    (body ? `${body}\n` : "") +
    `  </payments>\n` +
    `</PropManageReport>\n`
  );
}

export function buildTenantsXml(rows: TenantExportRow[], meta: ReportXmlMeta): string {
  const attrs = [
    `type="${escapeXml(meta.type)}"`,
    `generatedAt="${escapeXml(meta.generatedAt)}"`,
    `landlordId="${escapeXml(meta.landlordId ?? "")}"`,
  ].join(" ");
  const body = rows
    .map(
      (r) =>
        `    <tenant>\n` +
        `      ${el("id", r.id)}\n` +
        `      ${el("name", r.name)}\n` +
        `      ${el("email", r.email)}\n` +
        `      ${el("property", r.property)}\n` +
        `      ${el("unit", r.unit)}\n` +
        `      ${el("rentAmount", r.rentAmount)}\n` +
        `      ${el("leaseStart", r.leaseStart)}\n` +
        `      ${el("leaseEnd", r.leaseEnd)}\n` +
        `      ${el("status", r.status)}\n` +
        `    </tenant>`,
    )
    .join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<PropManageReport ${attrs}>\n` +
    `  <tenants>\n` +
    (body ? `${body}\n` : "") +
    `  </tenants>\n` +
    `</PropManageReport>\n`
  );
}
