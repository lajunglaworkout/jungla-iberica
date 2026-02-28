-- SEC-06: Row Level Security (RLS) para Supabase
-- Ejecutar en Supabase Dashboard → SQL Editor
-- IMPORTANTE: Verificar que cada tabla existe antes de ejecutar

-- ============================================================
-- 1. EMPLOYEES — Solo pueden ver sus propios datos
-- ============================================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Lectura: Managers/admins ven todos, empleados solo a sí mismos
CREATE POLICY "employees_select_own_or_manager" ON employees
  FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'email' = email
    OR EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('manager', 'admin', 'superadmin', 'CEO', 'Director')
    )
  );

-- Escritura: Solo managers/admins
CREATE POLICY "employees_update_manager" ON employees
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('manager', 'admin', 'superadmin', 'CEO', 'Director')
    )
  );

-- ============================================================
-- 2. NOTIFICATIONS — Solo ver las propias
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own" ON notifications
  FOR ALL TO authenticated
  USING (recipient_email = auth.jwt() ->> 'email')
  WITH CHECK (recipient_email = auth.jwt() ->> 'email');

-- ============================================================
-- 3. TIMECLOCK_RECORDS — Empleados ven los suyos, HR ve todos
-- ============================================================
ALTER TABLE timeclock_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeclock_own_or_hr" ON timeclock_records
  FOR SELECT TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE email = auth.jwt() ->> 'email'
    )
    OR EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('manager', 'admin', 'superadmin', 'HR')
    )
  );

CREATE POLICY "timeclock_insert_own" ON timeclock_records
  FOR INSERT TO authenticated
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "timeclock_update_own" ON timeclock_records
  FOR UPDATE TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE email = auth.jwt() ->> 'email'
    )
  );

-- ============================================================
-- 4. INCIDENTS — Empleados ven los suyos, HR/managers ven todos
-- ============================================================
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incidents_own_or_manager" ON incidents
  FOR SELECT TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE email = auth.jwt() ->> 'email'
    )
    OR EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('manager', 'admin', 'superadmin', 'HR', 'logistics')
    )
  );

CREATE POLICY "incidents_insert_own" ON incidents
  FOR INSERT TO authenticated
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "incidents_update_manager" ON incidents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('manager', 'admin', 'superadmin', 'HR', 'logistics')
    )
  );

-- ============================================================
-- 5. INVENTORY_ITEMS — Lectura para todos, escritura para managers
-- ============================================================
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_read_all" ON inventory_items
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "inventory_write_manager" ON inventory_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('manager', 'admin', 'superadmin', 'logistics')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('manager', 'admin', 'superadmin', 'logistics')
    )
  );

-- ============================================================
-- 6. QUARTERLY_REVIEWS — Lectura para involucrados
-- ============================================================
ALTER TABLE quarterly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quarterly_reviews_read" ON quarterly_reviews
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "quarterly_reviews_write_manager" ON quarterly_reviews
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('manager', 'admin', 'superadmin', 'logistics')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('manager', 'admin', 'superadmin', 'logistics')
    )
  );

-- ============================================================
-- 7. QUARTERLY_REVIEW_ITEMS — Lectura para todos, escritura para asignados
-- ============================================================
ALTER TABLE quarterly_review_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_items_read" ON quarterly_review_items
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "review_items_write" ON quarterly_review_items
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 8. QUARTERLY_INVENTORY_ASSIGNMENTS — Lectura para asignados/managers
-- ============================================================
ALTER TABLE quarterly_inventory_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignments_read" ON quarterly_inventory_assignments
  FOR SELECT TO authenticated
  USING (
    assigned_to = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('manager', 'admin', 'superadmin', 'logistics')
    )
  );

CREATE POLICY "assignments_write_manager" ON quarterly_inventory_assignments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('manager', 'admin', 'superadmin', 'logistics')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('manager', 'admin', 'superadmin', 'logistics')
    )
  );

-- ============================================================
-- VERIFICACIÓN: Listar tablas con RLS habilitado
-- ============================================================
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
