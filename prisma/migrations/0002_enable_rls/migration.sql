-- Enable Row Level Security on both tables
-- Fixes: "RLS Disabled in Public" errors for public.User and public.AgentRun
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgentRun" ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (used by Prisma server-side via POSTGRES_URL)
-- Note: service_role bypasses RLS by default in Supabase — no explicit policy needed.
-- The postgres superuser role also bypasses RLS by default.

-- Block anon and authenticated roles from direct table access via PostgREST
-- (no SELECT/INSERT/UPDATE/DELETE policies = deny all for those roles)
REVOKE SELECT, INSERT, UPDATE, DELETE ON "User" FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON "AgentRun" FROM anon, authenticated;

-- Fixes: "Sensitive Columns Exposed" — revoke column-level grants on sensitive fields
-- (belt-and-suspenders on top of the table-level revoke above)
REVOKE SELECT ("api_key", "stripe_customer_id") ON "User" FROM anon, authenticated;
