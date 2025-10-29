-- ============================================
-- ESQUEMA DE BASE DE DATOS - TURNOS Y FICHAJES (VERSIÓN SEGURA)
-- La Jungla Ibérica CRM
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Esta versión maneja conflictos de elementos ya existentes
-- ============================================

-- ============================================
-- ACTUALIZAR TABLA SHIFTS CON NUEVOS CAMPOS
-- ============================================

-- Añadir columnas nuevas solo si no existen
DO $$ 
BEGIN
    -- Añadir max_employees si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shifts' AND column_name = 'max_employees') THEN
        ALTER TABLE shifts ADD COLUMN max_employees INTEGER DEFAULT 1;
    END IF;
    
    -- Añadir min_employees si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shifts' AND column_name = 'min_employees') THEN
        ALTER TABLE shifts ADD COLUMN min_employees INTEGER DEFAULT 1;
    END IF;
    
    -- Añadir is_support si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shifts' AND column_name = 'is_support') THEN
        ALTER TABLE shifts ADD COLUMN is_support BOOLEAN DEFAULT false;
    END IF;
    
    -- Añadir description si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shifts' AND column_name = 'description') THEN
        ALTER TABLE shifts ADD COLUMN description TEXT;
    END IF;
END $$;

-- ============================================
-- CREAR NUEVAS TABLAS SOLO SI NO EXISTEN
-- ============================================

-- TABLA: SHIFT_CHANGES (Historial de Cambios)
CREATE TABLE IF NOT EXISTS shift_changes (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(255),
  original_shift_id BIGINT REFERENCES shifts(id),
  new_shift_id BIGINT REFERENCES shifts(id),
  change_date DATE NOT NULL,
  change_type VARCHAR(50), -- 'substitution', 'swap', 'extra', 'absence'
  reason VARCHAR(100),     -- 'vacation', 'sick', 'personal', 'coverage'
  approved_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: SHIFT_COVERAGE (Control de Cobertura)
CREATE TABLE IF NOT EXISTS shift_coverage (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  shift_id BIGINT REFERENCES shifts(id),
  required_employees INTEGER,
  assigned_employees INTEGER,
  is_covered BOOLEAN DEFAULT false,
  coverage_status VARCHAR(20), -- 'full', 'partial', 'uncovered'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, shift_id)
);

-- ============================================
-- CREAR ÍNDICES SOLO SI NO EXISTEN
-- ============================================

-- Índices para shift_changes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shift_changes_employee') THEN
        CREATE INDEX idx_shift_changes_employee ON shift_changes(employee_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shift_changes_date') THEN
        CREATE INDEX idx_shift_changes_date ON shift_changes(change_date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shift_changes_type') THEN
        CREATE INDEX idx_shift_changes_type ON shift_changes(change_type);
    END IF;
END $$;

-- Índices para shift_coverage
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shift_coverage_date') THEN
        CREATE INDEX idx_shift_coverage_date ON shift_coverage(date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shift_coverage_shift') THEN
        CREATE INDEX idx_shift_coverage_shift ON shift_coverage(shift_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shift_coverage_status') THEN
        CREATE INDEX idx_shift_coverage_status ON shift_coverage(coverage_status);
    END IF;
END $$;

-- ============================================
-- HABILITAR RLS EN NUEVAS TABLAS
-- ============================================

-- Habilitar RLS solo si las tablas existen
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shift_changes') THEN
        ALTER TABLE shift_changes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shift_coverage') THEN
        ALTER TABLE shift_coverage ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================
-- CREAR POLÍTICAS RLS SOLO SI NO EXISTEN
-- ============================================

-- Política para shift_changes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shift_changes' AND policyname = 'Allow all operations for authenticated users') THEN
        CREATE POLICY "Allow all operations for authenticated users" ON shift_changes FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Política para shift_coverage
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shift_coverage' AND policyname = 'Allow all operations for authenticated users') THEN
        CREATE POLICY "Allow all operations for authenticated users" ON shift_coverage FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- ============================================
-- FUNCIONES AUXILIARES AVANZADAS
-- ============================================

-- Función para calcular horas mensuales por empleado
CREATE OR REPLACE FUNCTION calculate_monthly_hours(emp_id VARCHAR(255), target_month DATE)
RETURNS TABLE(regular_hours DECIMAL(6,2), overtime_hours DECIMAL(6,2), total_hours DECIMAL(6,2)) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(da.worked_hours), 0)::DECIMAL(6,2) as regular_hours,
    COALESCE(SUM(da.overtime_hours), 0)::DECIMAL(6,2) as overtime_hours,
    COALESCE(SUM(da.worked_hours + da.overtime_hours), 0)::DECIMAL(6,2) as total_hours
  FROM daily_attendance da
  WHERE da.employee_id = emp_id
    AND DATE_TRUNC('month', da.date) = DATE_TRUNC('month', target_month);
END;
$$ LANGUAGE plpgsql;

-- Función para encontrar empleados disponibles para sustitución
CREATE OR REPLACE FUNCTION find_available_substitutes(
  target_shift_id BIGINT, 
  target_date DATE,
  target_center_id BIGINT
)
RETURNS TABLE(
  employee_id VARCHAR(255),
  employee_name TEXT,
  weekly_hours DECIMAL(6,2),
  has_experience BOOLEAN
) AS $$
DECLARE
  target_start_time TIME;
  target_end_time TIME;
BEGIN
  -- Obtener horarios del turno objetivo
  SELECT start_time, end_time INTO target_start_time, target_end_time
  FROM shifts WHERE id = target_shift_id;
  
  RETURN QUERY
  SELECT 
    e.id as employee_id,
    CONCAT(e.nombre, ' ', e.apellidos) as employee_name,
    COALESCE(
      (SELECT SUM(da.worked_hours + da.overtime_hours)
       FROM daily_attendance da
       WHERE da.employee_id = e.id
         AND da.date >= target_date - INTERVAL '6 days'
         AND da.date <= target_date), 
      0
    )::DECIMAL(6,2) as weekly_hours,
    EXISTS(
      SELECT 1 FROM employee_shifts es
      WHERE es.employee_id = e.id 
        AND es.shift_id = target_shift_id
        AND es.date >= target_date - INTERVAL '30 days'
    ) as has_experience
  FROM employees e
  WHERE e.center_id = target_center_id
    AND e.activo = true
    AND NOT EXISTS (
      SELECT 1 FROM employee_shifts es2
      JOIN shifts s ON s.id = es2.shift_id
      WHERE es2.employee_id = e.id
        AND es2.date = target_date
        AND (s.start_time, s.end_time) OVERLAPS (target_start_time, target_end_time)
    )
  ORDER BY has_experience DESC, weekly_hours ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para validar cobertura de turnos
CREATE OR REPLACE FUNCTION validate_shift_coverage(target_date DATE)
RETURNS VOID AS $$
DECLARE
  shift_record RECORD;
  assigned_count INTEGER;
  coverage_stat VARCHAR(20);
BEGIN
  -- Iterar sobre todos los turnos activos
  FOR shift_record IN 
    SELECT s.id, s.name, s.min_employees, s.max_employees
    FROM shifts s
    WHERE s.is_active = true
      AND (
        (EXTRACT(DOW FROM target_date) = 1 AND s.monday) OR
        (EXTRACT(DOW FROM target_date) = 2 AND s.tuesday) OR
        (EXTRACT(DOW FROM target_date) = 3 AND s.wednesday) OR
        (EXTRACT(DOW FROM target_date) = 4 AND s.thursday) OR
        (EXTRACT(DOW FROM target_date) = 5 AND s.friday) OR
        (EXTRACT(DOW FROM target_date) = 6 AND s.saturday) OR
        (EXTRACT(DOW FROM target_date) = 0 AND s.sunday)
      )
  LOOP
    -- Contar empleados asignados
    SELECT COUNT(*) INTO assigned_count
    FROM employee_shifts es
    WHERE es.shift_id = shift_record.id
      AND es.date = target_date
      AND es.status = 'assigned';
    
    -- Determinar estado de cobertura
    IF assigned_count >= shift_record.min_employees THEN
      coverage_stat := 'full';
    ELSIF assigned_count > 0 THEN
      coverage_stat := 'partial';
    ELSE
      coverage_stat := 'uncovered';
    END IF;
    
    -- Insertar o actualizar registro de cobertura
    INSERT INTO shift_coverage (date, shift_id, required_employees, assigned_employees, is_covered, coverage_status)
    VALUES (target_date, shift_record.id, shift_record.min_employees, assigned_count, assigned_count >= shift_record.min_employees, coverage_stat)
    ON CONFLICT (date, shift_id) 
    DO UPDATE SET
      required_employees = EXCLUDED.required_employees,
      assigned_employees = EXCLUDED.assigned_employees,
      is_covered = EXCLUDED.is_covered,
      coverage_status = EXCLUDED.coverage_status;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS INICIALES - TURNOS REALES DE LA JUNGLA
-- ============================================

-- Insertar turnos reales para Sevilla (center_id = 9) solo si no existen
DO $$
BEGIN
  -- Solo insertar si no hay turnos para el centro 9
  IF NOT EXISTS (SELECT 1 FROM shifts WHERE center_id = 9) THEN
    INSERT INTO shifts (name, start_time, end_time, monday, tuesday, wednesday, thursday, friday, saturday, sunday, max_employees, min_employees, is_support, description, center_id) 
    VALUES 
    ('Apertura', '06:45', '08:00', true, true, true, true, true, true, false, 1, 1, false, 'Apertura del centro, preparación de instalaciones', 9),
    ('Turno Mañana', '08:00', '14:00', true, true, true, true, true, true, false, 3, 2, false, 'Turno principal de mañana', 9),
    ('Turno Tarde Principal', '14:00', '20:00', true, true, true, true, true, true, false, 3, 2, false, 'Turno principal de tarde', 9),
    ('Apoyo Tarde', '17:00', '21:00', true, true, true, true, true, true, false, 2, 1, true, 'Refuerzo en horas punta de tarde', 9),
    ('Cierre', '20:00', '22:15', true, true, true, true, true, true, false, 1, 1, false, 'Cierre del centro y limpieza final', 9),
    ('Turno Completo', '09:00', '19:00', false, false, false, false, false, true, true, 1, 1, false, 'Turno especial día completo', 9);
  END IF;
END $$;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Mostrar resumen de tablas creadas/actualizadas
DO $$
DECLARE
  shifts_count INTEGER;
  changes_count INTEGER;
  coverage_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO shifts_count FROM shifts;
  SELECT COUNT(*) INTO changes_count FROM shift_changes;
  SELECT COUNT(*) INTO coverage_count FROM shift_coverage;
  
  RAISE NOTICE '✅ SCRIPT EJECUTADO CORRECTAMENTE';
  RAISE NOTICE '📊 Turnos en sistema: %', shifts_count;
  RAISE NOTICE '📝 Registros de cambios: %', changes_count;
  RAISE NOTICE '🔍 Registros de cobertura: %', coverage_count;
  RAISE NOTICE '🚀 Sistema de turnos listo para usar';
END $$;
