export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          landlord_profile_id: string;
          tenant_profile_id: string;
          tenant_id: string | null;
          property_id: string | null;
          unit_id: string | null;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          landlord_profile_id: string;
          tenant_profile_id: string;
          tenant_id?: string | null;
          property_id?: string | null;
          unit_id?: string | null;
          last_message_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
      };
      landlords: {
        Row: { id: string; profile_id: string | null; full_name: string; email: string; created_at: string };
        Insert: { id?: string; profile_id?: string | null; full_name: string; email: string; created_at?: string };
        Update: { id?: string; profile_id?: string | null; full_name?: string; email?: string; created_at?: string };
      };
      houses: {
        Row: { id: string; property_id: string; house_number: string; bedroom_count: number; created_at: string };
        Insert: { id?: string; property_id: string; house_number: string; bedroom_count: number; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["houses"]["Insert"]>;
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
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_profile_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_profile_id: string;
          body: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
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
          phone: string | null;
          company: string | null;
          country: string | null;
          avatar_path: string | null;
          two_factor_enabled: boolean;
          notification_email_enabled: boolean;
          notification_in_app_enabled: boolean;
          billing_plan: string;
          billing_status: string;
          payment_last4: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          full_name: string;
          email: string;
          role: "admin" | "landlord" | "tenant";
          onboarding_state?: Json | null;
          phone?: string | null;
          company?: string | null;
          country?: string | null;
          avatar_path?: string | null;
          two_factor_enabled?: boolean;
          notification_email_enabled?: boolean;
          notification_in_app_enabled?: boolean;
          billing_plan?: string;
          billing_status?: string;
          payment_last4?: string | null;
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

