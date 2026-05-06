export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      landlords: {
        Row: { id: string; profile_id: string | null; full_name: string; email: string; created_at: string };
        Insert: { id?: string; profile_id?: string | null; full_name: string; email: string; created_at?: string };
        Update: { id?: string; profile_id?: string | null; full_name?: string; email?: string; created_at?: string };
      };
      maintenance_requests: {
        Row: {
          id: string;
          unit_id: string;
          category: string;
          description: string;
          urgency: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          category: string;
          description: string;
          urgency: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["maintenance_requests"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          tenant_id: string;
          amount: number;
          payment_date: string;
          due_date: string;
          status: string;
          method: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          amount: number;
          payment_date: string;
          due_date: string;
          status: string;
          method: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          email: string;
          role: "admin" | "landlord" | "tenant";
          onboarding_state: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          full_name: string;
          email: string;
          role: "admin" | "landlord" | "tenant";
          onboarding_state?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      properties: {
        Row: {
          id: string;
          landlord_id: string;
          name: string;
          address: string;
          city: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          name: string;
          address: string;
          city: string;
          type: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
      };
      property_photos: {
        Row: { id: string; property_id: string; storage_path: string; is_primary: boolean; created_at: string };
        Insert: { id?: string; property_id: string; storage_path: string; is_primary?: boolean; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["property_photos"]["Insert"]>;
      };
      tenants: {
        Row: { id: string; unit_id: string; full_name: string; email: string; lease_start: string; lease_end: string };
        Insert: {
          id?: string;
          unit_id: string;
          full_name: string;
          email: string;
          lease_start: string;
          lease_end: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>;
      };
      units: {
        Row: { id: string; property_id: string; unit_number: string; rent_amount: number; status: string };
        Insert: { id?: string; property_id: string; unit_number: string; rent_amount: number; status?: string };
        Update: Partial<Database["public"]["Tables"]["units"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

