-- Script para añadir sistema de estados a turnos y tabla de festivos
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- 1. AÑADIR CAMPO STATUS A SHIFTS
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shifts' AND column_name = 'status'
    ) THEN
        ALTER TABLE shifts ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
        COMMENT ON COLUMN shifts.status IS 'Estado del turno: draft (borrador), published (publicado), archived (archivado)';
    END IF;
END $$;

-- =====================================================
-- 2. AÑADIR CAMPO PUBLISHED_AT A SHIFTS
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shifts' AND column_name = 'published_at'
    ) THEN
        ALTER TABLE shifts ADD COLUMN published_at TIMESTAMPTZ;
        COMMENT ON COLUMN shifts.published_at IS 'Fecha y hora de publicación del turno';
    END IF;
END $$;

-- =====================================================
-- 3. AÑADIR CAMPO PUBLISHED_BY A SHIFTS
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shifts' AND column_name = 'published_by'
    ) THEN
        ALTER TABLE shifts ADD COLUMN published_by TEXT;
        COMMENT ON COLUMN shifts.published_by IS 'Email del usuario que publicó el turno';
    END IF;
END $$;

-- =====================================================
-- 4. CREAR TABLA DE FESTIVOS
-- =====================================================
CREATE TABLE IF NOT EXISTS holidays (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('national', 'regional', 'local')),
  center_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, center_id)
);

-- Índices para holidays
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);
CREATE INDEX IF NOT EXISTS idx_holidays_center ON holidays(center_id);
CREATE INDEX IF NOT EXISTS idx_holidays_type ON holidays(type);
CREATE INDEX IF NOT EXISTS idx_holidays_active ON holidays(is_active);

-- Habilitar RLS
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

-- Políticas para holidays
CREATE POLICY "Todos pueden leer festivos" ON holidays FOR SELECT USING (true);
CREATE POLICY "Admins pueden gestionar festivos" ON holidays FOR ALL USING (true);

-- Comentarios
COMMENT ON TABLE holidays IS 'Festivos nacionales, regionales y locales por centro';
COMMENT ON COLUMN holidays.type IS 'Tipo: national (nacional), regional (autonómico), local (por centro)';
COMMENT ON COLUMN holidays.center_id IS 'ID del centro (solo para festivos locales)';

-- =====================================================
-- 5. INSERTAR FESTIVOS NACIONALES 2025
-- =====================================================
INSERT INTO holidays (name, date, type, center_id) VALUES
  ('Año Nuevo', '2025-01-01', 'national', NULL),
  ('Reyes Magos', '2025-01-06', 'national', NULL),
  ('Viernes Santo', '2025-04-18', 'national', NULL),
  ('Día del Trabajo', '2025-05-01', 'national', NULL),
  ('Asunción de la Virgen', '2025-08-15', 'national', NULL),
  ('Fiesta Nacional de España', '2025-10-12', 'national', NULL),
  ('Todos los Santos', '2025-11-01', 'national', NULL),
  ('Día de la Constitución', '2025-12-06', 'national', NULL),
  ('Inmaculada Concepción', '2025-12-08', 'national', NULL),
  ('Navidad', '2025-12-25', 'national', NULL)
ON CONFLICT (date, center_id) DO NOTHING;

-- =====================================================
-- 6. INSERTAR FESTIVOS REGIONALES ANDALUCÍA 2025
-- =====================================================
INSERT INTO holidays (name, date, type, center_id) VALUES
  ('Día de Andalucía', '2025-02-28', 'regional', NULL),
  ('Jueves Santo', '2025-04-17', 'regional', NULL)
ON CONFLICT (date, center_id) DO NOTHING;

-- =====================================================
-- 7. CREAR TABLA DE NOTIFICACIONES DE TURNOS
-- =====================================================
CREATE TABLE IF NOT EXISTS shift_notifications (
  id BIGSERIAL PRIMARY KEY,
  shift_id BIGINT REFERENCES shifts(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('published', 'modified', 'cancelled')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para shift_notifications
CREATE INDEX IF NOT EXISTS idx_shift_notifications_shift ON shift_notifications(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_notifications_employee ON shift_notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_notifications_type ON shift_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_shift_notifications_status ON shift_notifications(status);

-- Habilitar RLS
ALTER TABLE shift_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para shift_notifications
CREATE POLICY "Todos pueden leer notificaciones" ON shift_notifications FOR SELECT USING (true);
CREATE POLICY "Sistema puede crear notificaciones" ON shift_notifications FOR INSERT WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE shift_notifications IS 'Historial de notificaciones enviadas por cambios en turnos';
COMMENT ON COLUMN shift_notifications.notification_type IS 'Tipo: published (publicado), modified (modificado), cancelled (cancelado)';

-- =====================================================
-- 8. ACTUALIZAR TURNOS EXISTENTES A ESTADO PUBLICADO
-- =====================================================
UPDATE shifts 
SET status = 'published', 
    published_at = created_at,
    published_by = 'sistema'
WHERE status IS NULL OR status = 'draft';

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 'Columnas añadidas a shifts' as mensaje;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'shifts' 
AND column_name IN ('status', 'published_at', 'published_by')
ORDER BY column_name;

SELECT 'Tabla holidays creada' as mensaje;
SELECT COUNT(*) as total_festivos FROM holidays;

SELECT 'Tabla shift_notifications creada' as mensaje;
SELECT COUNT(*) as total_notificaciones FROM shift_notifications;

SELECT '✅ Sistema de estados y festivos implementado correctamente' as resultado;
