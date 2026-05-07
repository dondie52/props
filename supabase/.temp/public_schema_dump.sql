


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."landlords" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "profile_id" "uuid"
);


ALTER TABLE "public"."landlords" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "category" "text" NOT NULL,
    "description" "text" NOT NULL,
    "urgency" "text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."maintenance_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "payment_date" "date" NOT NULL,
    "due_date" "date" NOT NULL,
    "status" "text" NOT NULL,
    "method" "text" NOT NULL
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid",
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "onboarding_state" "jsonb",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'landlord'::"text", 'tenant'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."properties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "landlord_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "address" "text" NOT NULL,
    "city" "text" NOT NULL,
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."property_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "property_id" "uuid" NOT NULL,
    "storage_path" "text" NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."property_photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "lease_start" "date" NOT NULL,
    "lease_end" "date" NOT NULL
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."units" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "property_id" "uuid" NOT NULL,
    "unit_number" "text" NOT NULL,
    "rent_amount" numeric NOT NULL,
    "status" "text" DEFAULT 'vacant'::"text" NOT NULL
);


ALTER TABLE "public"."units" OWNER TO "postgres";


ALTER TABLE ONLY "public"."landlords"
    ADD CONSTRAINT "landlords_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."landlords"
    ADD CONSTRAINT "landlords_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."landlords"
    ADD CONSTRAINT "landlords_profile_id_key" UNIQUE ("profile_id");



ALTER TABLE ONLY "public"."maintenance_requests"
    ADD CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_photos"
    ADD CONSTRAINT "property_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_pkey" PRIMARY KEY ("id");



CREATE INDEX "maintenance_requests_unit_id_idx" ON "public"."maintenance_requests" USING "btree" ("unit_id");



CREATE INDEX "payments_tenant_id_idx" ON "public"."payments" USING "btree" ("tenant_id");



CREATE INDEX "properties_landlord_id_idx" ON "public"."properties" USING "btree" ("landlord_id");



CREATE UNIQUE INDEX "property_photos_one_primary_per_property" ON "public"."property_photos" USING "btree" ("property_id") WHERE "is_primary";



CREATE INDEX "property_photos_property_id_idx" ON "public"."property_photos" USING "btree" ("property_id");



CREATE INDEX "tenants_unit_id_idx" ON "public"."tenants" USING "btree" ("unit_id");



CREATE INDEX "units_property_id_idx" ON "public"."units" USING "btree" ("property_id");



ALTER TABLE ONLY "public"."landlords"
    ADD CONSTRAINT "landlords_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."maintenance_requests"
    ADD CONSTRAINT "maintenance_requests_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "public"."landlords"("id");



ALTER TABLE ONLY "public"."property_photos"
    ADD CONSTRAINT "property_photos_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id");



ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id");



ALTER TABLE "public"."landlords" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."maintenance_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."properties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property_photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."units" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON TABLE "public"."landlords" TO "anon";
GRANT ALL ON TABLE "public"."landlords" TO "authenticated";
GRANT ALL ON TABLE "public"."landlords" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_requests" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_requests" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."properties" TO "anon";
GRANT ALL ON TABLE "public"."properties" TO "authenticated";
GRANT ALL ON TABLE "public"."properties" TO "service_role";



GRANT ALL ON TABLE "public"."property_photos" TO "anon";
GRANT ALL ON TABLE "public"."property_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."property_photos" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT ALL ON TABLE "public"."units" TO "anon";
GRANT ALL ON TABLE "public"."units" TO "authenticated";
GRANT ALL ON TABLE "public"."units" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







