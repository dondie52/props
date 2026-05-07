import PropertyDetailsClient, { type PaymentPreviewRow, type UnitRow } from "@/app/dashboard/properties/[id]/PropertyDetailsClient";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";

type PageProps = {
  params: { id: string };
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 })
    .format(value)
    .replace("BWP", "P")
    .trim();

const mapPaymentStatus = (status: unknown): PaymentPreviewRow["status"] =>
  status === "paid" || status === "pending" || status === "overdue" ? status : "pending";

export default async function Page({ params }: PageProps) {
  const propertyId = params.id;
  const supabase = createSupabaseServerComponentClient();

  const [{ data: propertyData }, { data: unitData }] = await Promise.all([
    supabase.from("properties").select("id,name,address,city,type").eq("id", propertyId).single(),
    supabase
      .from("units")
      .select("id,unit_number,rent_amount,status,tenants(id,full_name,email,lease_start,lease_end)")
      .eq("property_id", propertyId)
      .order("unit_number", { ascending: true }),
  ]);

  const tenantIds = (unitData ?? [])
    .map((unit) => {
      const tenant = Array.isArray(unit.tenants) ? unit.tenants[0] : unit.tenants;
      return tenant?.id;
    })
    .filter((id): id is string => Boolean(id));

  const { data: paymentData } = tenantIds.length
    ? await supabase
        .from("payments")
        .select("id,tenant_id,amount,payment_date,due_date,status")
        .in("tenant_id", tenantIds)
        .order("payment_date", { ascending: false })
    : { data: [] };

  const paymentsByTenant = new Map<string, PaymentPreviewRow[]>();
  for (const payment of paymentData ?? []) {
    const tenantId = String(payment.tenant_id ?? "");
    const current = paymentsByTenant.get(tenantId) ?? [];
    if (current.length < 3) {
      current.push({
        id: payment.id,
        amount: Number(payment.amount ?? 0),
        paymentDate: payment.payment_date ?? payment.due_date ?? "-",
        dueDate: payment.due_date ?? "-",
        status: mapPaymentStatus(payment.status),
      });
    }
    paymentsByTenant.set(tenantId, current);
  }

  const units: UnitRow[] = (unitData ?? []).map((unit) => {
    const tenant = Array.isArray(unit.tenants) ? unit.tenants[0] : unit.tenants;
    const leaseEnd = tenant?.lease_end ?? "-";
    const status: UnitRow["status"] =
      unit.status === "vacant" || !tenant?.id
        ? "vacant"
        : leaseEnd !== "-" && new Date(leaseEnd).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 60
          ? "expiring"
          : "occupied";
    const rentAmount = Number(unit.rent_amount ?? 0);

    return {
      id: unit.id,
      number: unit.unit_number ?? "-",
      tenantId: tenant?.id ?? null,
      tenant: tenant?.full_name ?? "-",
      tenantEmail: tenant?.email ?? "",
      leaseStart: tenant?.lease_start ?? "-",
      leaseEnd,
      rentAmount,
      rent: formatMoney(rentAmount),
      status,
      payments: tenant?.id ? paymentsByTenant.get(tenant.id) ?? [] : [],
    };
  });

  const property = {
    id: propertyData?.id ?? propertyId,
    name: propertyData?.name ?? "Property",
    address: propertyData ? `${propertyData.address}, ${propertyData.city}` : "",
    type: propertyData?.type ?? "",
  };

  return <PropertyDetailsClient property={property} initialUnits={units} />;
}
