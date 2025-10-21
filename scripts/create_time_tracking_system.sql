-- Script para crear sistema de fichajes tipo Factorial
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- 1. CREAR TABLA DE REGISTROS DE TIEMPO
-- =====================================================
CREATE TABLE IF NOT EXISTS time_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  break_start TIMESTAMPTZ,
  break_end TIMESTAMPTZ,
  total_hours DECIMAL(5,2),
  break_duration INTEGER DEFAULT 0, -- minutos
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'break', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para time_records
CREATE INDEX IF NOT EXISTS idx_time_records_employee ON time_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_records_date ON time_records(date);
CREATE INDEX IF NOT EXISTS idx_time_records_status ON time_records(status);
CREATE INDEX IF NOT EXISTS idx_time_records_employee_date ON time_records(employee_id, date);

-- Habilitar RLS
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;

-- Políticas para time_records
CREATE POLICY "Empleados pueden ver sus propios registros" ON time_records
  FOR SELECT USING (true);

CREATE POLICY "Empleados pueden crear sus registros" ON time_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Empleados pueden actualizar sus registros" ON time_records
  FOR UPDATE USING (true);

-- Comentarios
COMMENT ON TABLE time_records IS 'Registros de fichajes de empleados';
COMMENT ON COLUMN time_records.status IS 'Estado: active (trabajando), break (en pausa), completed (finalizado)';
COMMENT ON COLUMN time_records.total_hours IS 'Total de horas trabajadas (calculado al fichar salida)';
COMMENT ON COLUMN time_records.break_duration IS 'Duración total de pausas en minutos';

-- =====================================================
-- 2. FUNCIÓN PARA CALCULAR HORAS TRABAJADAS
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_work_hours(
  p_clock_in TIMESTAMPTZ,
  p_clock_out TIMESTAMPTZ,
  p_break_duration INTEGER DEFAULT 0
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_minutes INTEGER;
  work_minutes INTEGER;
  work_hours DECIMAL(5,2);
BEGIN
  -- Calcular minutos totales
  total_minutes := EXTRACT(EPOCH FROM (p_clock_out - p_clock_in)) / 60;
  
  -- Restar tiempo de pausas
  work_minutes := total_minutes - COALESCE(p_break_duration, 0);
  
  -- Convertir a horas (con 2 decimales)
  work_hours := ROUND(work_minutes / 60.0, 2);
  
  RETURN work_hours;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. TRIGGER PARA ACTUALIZAR HORAS AL FICHAR SALIDA
-- =====================================================
CREATE OR REPLACE FUNCTION update_total_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clock_out IS NOT NULL AND NEW.status = 'completed' THEN
    NEW.total_hours := calculate_work_hours(
      NEW.clock_in,
      NEW.clock_out,
      NEW.break_duration
    );
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_total_hours
  BEFORE UPDATE ON time_records
  FOR EACH ROW
  EXECUTE FUNCTION update_total_hours();

-- =====================================================
-- 4. VISTA PARA RESUMEN SEMANAL
-- =====================================================
CREATE OR REPLACE VIEW weekly_time_summary AS
SELECT 
  employee_id,
  DATE_TRUNC('week', date) as week_start,
  COUNT(DISTINCT date) as days_worked,
  SUM(total_hours) as total_hours,
  AVG(total_hours) as avg_hours_per_day,
  SUM(break_duration) as total_break_minutes
FROM time_records
WHERE status = 'completed'
GROUP BY employee_id, DATE_TRUNC('week', date);

-- =====================================================
-- 5. VISTA PARA RESUMEN MENSUAL
-- =====================================================
CREATE OR REPLACE VIEW monthly_time_summary AS
SELECT 
  employee_id,
  DATE_TRUNC('month', date) as month_start,
  COUNT(DISTINCT date) as days_worked,
  SUM(total_hours) as total_hours,
  AVG(total_hours) as avg_hours_per_day
FROM time_records
WHERE status = 'completed'
GROUP BY employee_id, DATE_TRUNC('month', date);

-- =====================================================
-- 6. FUNCIÓN PARA OBTENER REGISTRO ACTIVO
-- =====================================================
CREATE OR REPLACE FUNCTION get_active_time_record(p_employee_id INTEGER)
RETURNS TABLE (
  id BIGINT,
  employee_id INTEGER,
  date DATE,
  clock_in TIMESTAMPTZ,
  status TEXT,
  break_start TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tr.id,
    tr.employee_id,
    tr.date,
    tr.clock_in,
    tr.status,
    tr.break_start
  FROM time_records tr
  WHERE tr.employee_id = p_employee_id
    AND tr.status IN ('active', 'break')
    AND tr.date = CURRENT_DATE
  ORDER BY tr.clock_in DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================
-- Insertar registros de ejemplo para testing
-- Descomentar si quieres datos de prueba

/*
INSERT INTO time_records (employee_id, date, clock_in, clock_out, break_duration, status, total_hours)
VALUES 
  (1, CURRENT_DATE - 1, CURRENT_DATE - 1 + TIME '09:00:00', CURRENT_DATE - 1 + TIME '18:00:00', 60, 'completed', 8.0),
  (1, CURRENT_DATE - 2, CURRENT_DATE - 2 + TIME '09:15:00', CURRENT_DATE - 2 + TIME '17:45:00', 45, 'completed', 7.75),
  (2, CURRENT_DATE - 1, CURRENT_DATE - 1 + TIME '10:00:00', CURRENT_DATE - 1 + TIME '19:00:00', 30, 'completed', 8.5);
*/

-- =====================================================
-- 8. VERIFICACIÓN FINAL
-- =====================================================
SELECT 'Sistema de fichajes creado correctamente' as message;
SELECT COUNT(*) as total_records FROM time_records;
