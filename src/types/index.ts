export type Landlord = {
  id: string;
  profile_id?: string | null;
  full_name: string;
  email: string;
  created_at: string;
};

export type UserRole = "admin" | "landlord" | "tenant";

export type Profile = {
  id: string;
  auth_user_id?: string | null;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
};

export type Property = {
  id: string;
  landlord_id: string;
  name: string;
  address: string;
  city: string;
  type: string;
};

export type Unit = {
  id: string;
  property_id: string;
  unit_number: string;
  rent_amount: number;
  status: string;
};

export type Tenant = {
  id: string;
  unit_id: string;
  full_name: string;
  email: string;
  lease_start: string;
  lease_end: string;
};

export type Payment = {
  id: string;
  tenant_id: string;
  amount: number;
  payment_date: string;
  due_date: string;
  status: string;
  method: string;
};

export type MaintenanceRequest = {
  id: string;
  unit_id: string;
  category: string;
  description: string;
  urgency: string;
  status: string;
  created_at: string;
};
