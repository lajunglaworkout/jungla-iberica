-- Script para crear tablas del sistema de fichajes
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- 1. TABLA: qr_tokens
-- Tokens QR generados para fichajes
-- =====================================================
CREATE TABLE IF NOT EXISTS qr_tokens (
  id BIGSERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  center_id TEXT NOT NULL,
  center_name TEXT NOT NULL,
  employee_id TEXT,
  employee_name TEXT,
  is_used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- Índices para qr_tokens
CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON qr_tokens(token);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_center ON qr_tokens(center_id);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_expires ON qr_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_is_used ON qr_tokens(is_used);

-- =====================================================
-- 2. TABLA: time_records
-- Registros de fichajes (entrada/salida)
-- =====================================================
CREATE TABLE IF NOT EXISTS time_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  center_id TEXT NOT NULL,
  center_name TEXT NOT NULL,
  clock_type TEXT NOT NULL CHECK (clock_type IN ('entrada', 'salida')),
  clock_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_accuracy DECIMAL(10, 2),
  qr_token_id BIGINT REFERENCES qr_tokens(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para time_records
CREATE INDEX IF NOT EXISTS idx_time_records_employee ON time_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_records_center ON time_records(center_id);
CREATE INDEX IF NOT EXISTS idx_time_records_date ON time_records(DATE(clock_time));
CREATE INDEX IF NOT EXISTS idx_time_records_type ON time_records(clock_type);

-- =====================================================
-- 3. TABLA: daily_attendance
-- Resumen diario de asistencia por empleado
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_attendance (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  center_id TEXT NOT NULL,
  center_name TEXT NOT NULL,
  date DATE NOT NULL,
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,
  total_hours DECIMAL(5, 2),
  status TEXT CHECK (status IN ('presente', 'ausente', 'tarde', 'incompleto')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, center_id, date)
);

-- Índices para daily_attendance
CREATE INDEX IF NOT EXISTS idx_daily_attendance_employee ON daily_attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_center ON daily_attendance(center_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_date ON daily_attendance(date);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_status ON daily_attendance(status);

-- =====================================================
-- 4. TABLA: shifts
-- Definición de turnos
-- =====================================================
CREATE TABLE IF NOT EXISTS shifts (
  id BIGSERIAL PRIMARY KEY,
  center_id TEXT NOT NULL,
  shift_name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL, -- 0=Domingo, 1=Lunes, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para shifts
CREATE INDEX IF NOT EXISTS idx_shifts_center ON shifts(center_id);
CREATE INDEX IF NOT EXISTS idx_shifts_active ON shifts(is_active);

-- =====================================================
-- 5. TABLA: employee_shifts
-- Asignación de empleados a turnos
-- =====================================================
CREATE TABLE IF NOT EXISTS employee_shifts (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  shift_id BIGINT REFERENCES shifts(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para employee_shifts
CREATE INDEX IF NOT EXISTS idx_employee_shifts_employee ON employee_shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_shift ON employee_shifts(shift_id);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_active ON employee_shifts(is_active);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_shifts ENABLE ROW LEVEL SECURITY;

-- Políticas para qr_tokens
CREATE POLICY "Todos pueden leer tokens" ON qr_tokens FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden crear tokens" ON qr_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuarios pueden actualizar tokens" ON qr_tokens FOR UPDATE USING (true);

-- Políticas para time_records
CREATE POLICY "Todos pueden leer fichajes" ON time_records FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden crear fichajes" ON time_records FOR INSERT WITH CHECK (true);

-- Políticas para daily_attendance
CREATE POLICY "Todos pueden leer asistencia" ON daily_attendance FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden crear asistencia" ON daily_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuarios pueden actualizar asistencia" ON daily_attendance FOR UPDATE USING (true);

-- Políticas para shifts
CREATE POLICY "Todos pueden leer turnos" ON shifts FOR SELECT USING (true);
CREATE POLICY "Admins pueden gestionar turnos" ON shifts FOR ALL USING (true);

-- Políticas para employee_shifts
CREATE POLICY "Todos pueden leer asignaciones" ON employee_shifts FOR SELECT USING (true);
CREATE POLICY "Admins pueden gestionar asignaciones" ON employee_shifts FOR ALL USING (true);

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TABLE qr_tokens IS 'Tokens QR generados para fichajes con validación';
COMMENT ON TABLE time_records IS 'Registros individuales de entrada/salida de empleados';
COMMENT ON TABLE daily_attendance IS 'Resumen diario de asistencia por empleado';
COMMENT ON TABLE shifts IS 'Definición de turnos de trabajo';
COMMENT ON TABLE employee_shifts IS 'Asignación de empleados a turnos específicos';

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Insertar turnos de ejemplo
INSERT INTO shifts (center_id, shift_name, start_time, end_time, days_of_week) VALUES
  ('9', 'Mañana', '07:00', '15:00', ARRAY[1,2,3,4,5]),
  ('9', 'Tarde', '15:00', '23:00', ARRAY[1,2,3,4,5]),
  ('9', 'Fin de Semana', '09:00', '21:00', ARRAY[0,6])
ON CONFLICT DO NOTHING;

-- Verificación final
SELECT 'Tablas creadas exitosamente' as mensaje;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('qr_tokens', 'time_records', 'daily_attendance', 'shifts', 'employee_shifts')
ORDER BY table_name;
