-- Security Hardening Migration

-- 1. Helper function to get current user's role safely
-- This function runs with SECURITY DEFINER to read the employees table even if RLS would block it.
-- It relies on the EMAIL in the JWT matching the EMAIL in the employees table.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role
  FROM public.employees
  WHERE email = (auth.jwt() ->> 'email')::text
  LIMIT 1;
$$;

-- 2. Enable RLS on employees table (ensure it's on)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing permissive policies (if any known ones exist, or we can just create new ones)
-- We attempt to drop the generic "Allow all" if it exists from previous migrations.
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.employees;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.employees;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.employees;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.employees;

-- 4. Create Strict Policies for 'employees' table

-- READ: All authenticated users can read employee data (for directory/UI)
CREATE POLICY "Allow read for authenticated users"
ON public.employees
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Only Admins can create new employees
CREATE POLICY "Allow insert for Admins"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_my_role() IN ('Admin', 'Director', 'CEO', 'SuperAdmin', 'superadmin', 'admin')
  OR
  (auth.jwt() ->> 'email') IN ('carlossuarezparra@gmail.com', 'lajunglacentral@gmail.com')
);

-- UPDATE: Admins can update ANY profile. Users can update THEIR OWN profile.
CREATE POLICY "Allow update for Admins and Own Profile"
ON public.employees
FOR UPDATE
TO authenticated
USING (
  public.get_my_role() IN ('Admin', 'Director', 'CEO', 'SuperAdmin', 'superadmin', 'admin')
  OR
  email = (auth.jwt() ->> 'email')
  OR
  (auth.jwt() ->> 'email') IN ('carlossuarezparra@gmail.com', 'lajunglacentral@gmail.com')
)
WITH CHECK (
  public.get_my_role() IN ('Admin', 'Director', 'CEO', 'SuperAdmin', 'superadmin', 'admin')
  OR
  email = (auth.jwt() ->> 'email')
  OR
  (auth.jwt() ->> 'email') IN ('carlossuarezparra@gmail.com', 'lajunglacentral@gmail.com')
);

-- DELETE: Only Admins can delete
CREATE POLICY "Allow delete for Admins"
ON public.employees
FOR DELETE
TO authenticated
USING (
  public.get_my_role() IN ('Admin', 'Director', 'CEO', 'SuperAdmin', 'superadmin', 'admin')
  OR
  (auth.jwt() ->> 'email') IN ('carlossuarezparra@gmail.com', 'lajunglacentral@gmail.com')
);

-- 5. Harden 'financial_data' table (Sensitive)
ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage all financial data" ON public.financial_data;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.financial_data;

CREATE POLICY "Allow read for Admin/Director/CEO/Manager"
ON public.financial_data
FOR SELECT
TO authenticated
USING (
  public.get_my_role() IN ('Admin', 'Director', 'CEO', 'Manager', 'SuperAdmin', 'superadmin', 'admin', 'manager')
  OR
  (auth.jwt() ->> 'email') IN ('carlossuarezparra@gmail.com')
);

CREATE POLICY "Allow write for Admin/Director/CEO"
ON public.financial_data
FOR ALL
TO authenticated
USING (
  public.get_my_role() IN ('Admin', 'Director', 'CEO', 'SuperAdmin', 'superadmin', 'admin')
)
WITH CHECK (
  public.get_my_role() IN ('Admin', 'Director', 'CEO', 'SuperAdmin', 'superadmin', 'admin')
);

-- 6. Harden 'shifts' table (Operational)
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.shifts;

-- Read: All authenticated (needed for view)
CREATE POLICY "Allow read for authenticated"
ON public.shifts
FOR SELECT
TO authenticated
USING (true);

-- Write: Only Managers/Admins/Encargados
CREATE POLICY "Allow write for Managers"
ON public.shifts
FOR ALL
TO authenticated
USING (
  public.get_my_role() IN ('Admin', 'Director', 'CEO', 'Manager', 'Encargado', 'center_manager')
)
WITH CHECK (
  public.get_my_role() IN ('Admin', 'Director', 'CEO', 'Manager', 'Encargado', 'center_manager')
);

