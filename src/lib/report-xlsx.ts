import * as XLSX from "xlsx";
import type { MaintenanceExportRow, PaymentExportRow, TenantExportRow } from "@/lib/report-export-data";

export type ReportWorkbookMeta = {
  generatedAt: string;
  landlordId?: string | null;
  /** Shown in workbook metadata row when set (e.g. admin or tenant scope). */
  scopeDescription?: string;
};

function metaRows(meta: ReportWorkbookMeta): (string | number)[][] {
  const rows: (string | number)[][] = [["Report generated (UTC)", meta.generatedAt]];
  if (meta.scopeDescription) {
    rows.push(["Scope", meta.scopeDescription]);
  }
  if (meta.landlordId) {
    rows.push(["Landlord ID", meta.landlordId]);
  }
  rows.push([]);
  return rows;
}

export function buildPaymentsXlsxBuffer(rows: PaymentExportRow[], meta: ReportWorkbookMeta): Buffer {
  const header = ["tenant", "property", "unit", "amount", "dueDate", "paymentDate", "method", "status"];
  const data = rows.map((r) => [r.tenant, r.property, r.unit, r.amount, r.dueDate, r.paymentDate, r.method, r.status]);
  const aoa = [...metaRows(meta), header, ...data];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "payments");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function buildTenantsXlsxBuffer(rows: TenantExportRow[], meta: ReportWorkbookMeta): Buffer {
  const header = ["id", "name", "email", "property", "unit", "rentAmount", "leaseStart", "leaseEnd", "status"];
  const data = rows.map((r) => [
    r.id,
    r.name,
    r.email,
    r.property,
    r.unit,
    r.rentAmount,
    r.leaseStart,
    r.leaseEnd,
    r.status,
  ]);
  const aoa = [...metaRows(meta), header, ...data];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "tenants");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function buildMaintenanceXlsxBuffer(rows: MaintenanceExportRow[], meta: ReportWorkbookMeta): Buffer {
  const header = ["category", "description", "status", "urgency", "createdAt"];
  const data = rows.map((r) => [r.category, r.description, r.status, r.urgency, r.createdAt]);
  const aoa = [...metaRows(meta), header, ...data];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "maintenance");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
