SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict jC532TY1EWjVHDHB1yUIleBWW1kcc3fYYBuVxuzLihe9tIpGsBQr5tOf8hf1tuR

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "auth_user_id", "full_name", "email", "role", "created_at", "onboarding_state") VALUES
	('00000000-0000-0000-0000-000000000001', NULL, 'System Admin', 'admin@propmanage.bw', 'admin', '2026-05-06 15:06:29.617323+00', NULL),
	('00000000-0000-0000-0000-000000000101', NULL, 'Kabelo Molefe', 'kabelo.landlord@propmanage.bw', 'landlord', '2026-05-06 15:06:29.617323+00', NULL),
	('00000000-0000-0000-0000-000000000102', NULL, 'Naledi Sechele', 'naledi.landlord@propmanage.bw', 'landlord', '2026-05-06 15:06:29.617323+00', NULL),
	('00000000-0000-0000-0000-000000000201', NULL, 'Tebogo Modise', 'tebogo.tenant@propmanage.bw', 'tenant', '2026-05-06 15:06:29.617323+00', NULL),
	('00000000-0000-0000-0000-000000000202', NULL, 'Neo Mooketsi', 'neo.tenant@propmanage.bw', 'tenant', '2026-05-06 15:06:29.617323+00', NULL),
	('00000000-0000-0000-0000-000000000203', NULL, 'Thuso Kgosi', 'thuso.tenant@propmanage.bw', 'tenant', '2026-05-06 15:06:29.617323+00', NULL),
	('00000000-0000-0000-0000-000000000204', NULL, 'Boipelo Ramokone', 'boipelo.tenant@propmanage.bw', 'tenant', '2026-05-06 15:06:29.617323+00', NULL),
	('00000000-0000-0000-0000-000000000205', NULL, 'Mpho Dube', 'mpho.tenant@propmanage.bw', 'tenant', '2026-05-06 15:06:29.617323+00', NULL),
	('00000000-0000-0000-0000-000000000206', NULL, 'Keneilwe Seema', 'keneilwe.tenant@propmanage.bw', 'tenant', '2026-05-06 15:06:29.617323+00', NULL);


--
-- Data for Name: landlords; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."landlords" ("id", "full_name", "email", "created_at", "profile_id") VALUES
	('10000000-0000-0000-0000-000000000001', 'Kabelo Molefe', 'kabelo.landlord@propmanage.bw', '2026-05-06 15:06:29.617323+00', '00000000-0000-0000-0000-000000000101'),
	('10000000-0000-0000-0000-000000000002', 'Naledi Sechele', 'naledi.landlord@propmanage.bw', '2026-05-06 15:06:29.617323+00', '00000000-0000-0000-0000-000000000102');


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."properties" ("id", "landlord_id", "name", "address", "city", "type", "created_at") VALUES
	('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Sunset Apartments', 'Plot 103', 'Gaborone', 'Apartment', '2026-05-06 15:06:29.617323+00'),
	('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'River View', 'Plot 42', 'Francistown', 'Complex', '2026-05-06 15:06:29.617323+00'),
	('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Kgale Homes', 'Plot 77', 'Gaborone', 'House', '2026-05-06 15:06:29.617323+00');


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."units" ("id", "property_id", "unit_number", "rent_amount", "status") VALUES
	('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'A1', 2400, 'occupied'),
	('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'A2', 2350, 'occupied'),
	('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'A3', 2200, 'vacant'),
	('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'B1', 2100, 'occupied'),
	('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'B2', 2050, 'occupied'),
	('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 'B3', 2000, 'vacant'),
	('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003', 'C1', 2600, 'occupied'),
	('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 'C2', 2550, 'occupied');


--
-- Data for Name: maintenance_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."maintenance_requests" ("id", "unit_id", "category", "description", "urgency", "status", "created_at") VALUES
	('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Plumbing', 'Kitchen sink leaking under cabinet', 'high', 'open', '2026-05-06 15:06:29.617323+00'),
	('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 'Electrical', 'Breaker trips when oven is used', 'medium', 'in-progress', '2026-05-06 15:06:29.617323+00'),
	('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000008', 'Paint', 'Bedroom repaint after patchwork', 'low', 'resolved', '2026-05-06 15:06:29.617323+00');


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tenants" ("id", "unit_id", "full_name", "email", "lease_start", "lease_end") VALUES
	('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Tebogo Modise', 'tebogo.tenant@propmanage.bw', '2026-01-01', '2026-12-30'),
	('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Neo Mooketsi', 'neo.tenant@propmanage.bw', '2026-01-15', '2026-07-15'),
	('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', 'Thuso Kgosi', 'thuso.tenant@propmanage.bw', '2025-10-01', '2026-04-20'),
	('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', 'Boipelo Ramokone', 'boipelo.tenant@propmanage.bw', '2026-02-01', '2027-01-11'),
	('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000007', 'Mpho Dube', 'mpho.tenant@propmanage.bw', '2026-03-01', '2026-10-02'),
	('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000008', 'Keneilwe Seema', 'keneilwe.tenant@propmanage.bw', '2026-02-20', '2026-08-30');


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."payments" ("id", "tenant_id", "amount", "payment_date", "due_date", "status", "method") VALUES
	('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 2400, '2026-05-04', '2026-05-06', 'paid', 'bank transfer'),
	('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 2350, '2026-05-05', '2026-05-06', 'pending', 'bank transfer'),
	('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 2100, '2026-05-03', '2026-05-05', 'overdue', 'cash'),
	('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', 2050, '2026-05-06', '2026-05-07', 'paid', 'bank transfer'),
	('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', 2600, '2026-05-02', '2026-05-03', 'pending', 'cash'),
	('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000006', 2550, '2026-05-11', '2026-05-12', 'paid', 'bank transfer');


--
-- Data for Name: property_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

-- \unrestrict jC532TY1EWjVHDHB1yUIleBWW1kcc3fYYBuVxuzLihe9tIpGsBQr5tOf8hf1tuR

RESET ALL;
