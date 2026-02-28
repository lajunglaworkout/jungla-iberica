-- SEC-09: Tabla de Auditoría (audit_log)
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Registra todas las acciones relevantes del sistema para trazabilidad
-- ============================================================

-- 1. Crear tabla audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id            BIGSERIAL PRIMARY KEY,
  user_id       TEXT,                         -- ID del usuario (employees.id)
  user_email    TEXT NOT NULL,                 -- Email del usuario que ejecutó la acción
  action        TEXT NOT NULL,                 -- Tipo de acción: INSERT, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  table_name    TEXT,                          -- Tabla afectada (NULL para acciones como LOGIN)
  record_id     TEXT,                          -- ID del registro afectado
  old_data      JSONB,                        -- Datos anteriores (para UPDATE/DELETE)
  new_data      JSONB,                        -- Datos nuevos (para INSERT/UPDATE)
  ip_address    INET,                         -- IP del cliente (si disponible)
  created_at    TIMESTAMPTZ DEFAULT NOW()      -- Timestamp de la acción
);

-- 2. Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_audit_log_user_email  ON audit_log(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_log_action      ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name  ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at  ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id   ON audit_log(record_id);

-- Índice compuesto para búsquedas por tabla + fecha (consultas más comunes)
CREATE INDEX IF NOT EXISTS idx_audit_log_table_date
  ON audit_log(table_name, created_at DESC);

-- 3. Habilitar RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Política de lectura: Solo admins/superadmins pueden leer el audit log
CREATE POLICY "audit_log_read_admins_only" ON audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email'
      AND e.position IN ('admin', 'superadmin', 'CEO', 'Director')
    )
  );

-- Política de inserción: Todos los autenticados pueden insertar (el sistema escribe logs)
CREATE POLICY "audit_log_insert_authenticated" ON audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- NO se permite UPDATE ni DELETE en audit_log → inmutabilidad garantizada
-- (No se crean políticas para UPDATE/DELETE, por lo que están bloqueadas por RLS)

-- 4. Comentario descriptivo en la tabla
COMMENT ON TABLE audit_log IS 'Registro de auditoría del sistema CRM. Inmutable: no se permite UPDATE ni DELETE.';
COMMENT ON COLUMN audit_log.action IS 'Acciones: LOGIN, LOGOUT, INSERT, UPDATE, DELETE, REVIEW_SUBMITTED, REVIEW_APPROVED, INCIDENT_CREATED, VACATION_REQUESTED, etc.';
COMMENT ON COLUMN audit_log.old_data IS 'Snapshot de datos ANTES de la modificación (para UPDATE y DELETE)';
COMMENT ON COLUMN audit_log.new_data IS 'Snapshot de datos DESPUÉS de la modificación (para INSERT y UPDATE)';

-- 5. Verificación
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'audit_log'
-- ORDER BY ordinal_position;
