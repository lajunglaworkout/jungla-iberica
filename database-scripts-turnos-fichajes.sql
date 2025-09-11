-- ============================================
-- ESQUEMA DE BASE DE DATOS - TURNOS Y FICHAJES
-- La Jungla Ibérica CRM
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ============================================

-- ============================================
-- TABLA 1: SHIFTS (Turnos) - ACTUALIZADA
-- ============================================
CREATE TABLE IF NOT EXISTS shifts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  monday BOOLEAN DEFAULT false,
  tuesday BOOLEAN DEFAULT false,
  wednesday BOOLEAN DEFAULT false,
  thursday BOOLEAN DEFAULT false,
  friday BOOLEAN DEFAULT false,
  saturday BOOLEAN DEFAULT false,
  sunday BOOLEAN DEFAULT false,
  break_minutes INTEGER DEFAULT 0,
  center_id BIGINT REFERENCES centers(id),
  max_employees INTEGER DEFAULT 1,
  min_employees INTEGER DEFAULT 1,
  is_support BOOLEAN DEFAULT false,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 2: EMPLOYEE_SHIFTS (Asignaciones de Turnos)
-- ============================================
CREATE TABLE IF NOT EXISTS employee_shifts (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(255),
  shift_id BIGINT REFERENCES shifts(id),
  date DATE NOT NULL,
  is_substitute BOOLEAN DEFAULT false,
  original_employee_id VARCHAR(255),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'assigned',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date, shift_id)
);

-- ============================================
-- TABLA 3: TIME_RECORDS (Registros de Fichajes)
-- ============================================
CREATE TABLE IF NOT EXISTS time_records (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(255),
  center_id BIGINT REFERENCES centers(id),
  date DATE NOT NULL,
  clock_in_time TIMESTAMP,
  clock_out_time TIMESTAMP,
  clock_in_method VARCHAR(20) DEFAULT 'manual',
  clock_out_method VARCHAR(20) DEFAULT 'manual',
  clock_in_location JSONB,
  clock_out_location JSONB,
  clock_in_qr_token VARCHAR(255),
  clock_out_qr_token VARCHAR(255),
  total_hours DECIMAL(4,2),
  break_minutes INTEGER DEFAULT 0,
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  is_late BOOLEAN DEFAULT false,
  is_early_departure BOOLEAN DEFAULT false,
  notes TEXT,
  validated_by VARCHAR(255),
  validation_notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA 4: DAILY_ATTENDANCE (Asistencia Diaria)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_attendance (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(255),
  center_id BIGINT REFERENCES centers(id),
  date DATE NOT NULL,
  scheduled_shift_id BIGINT REFERENCES shifts(id),
  actual_clock_in TIME,
  actual_clock_out TIME,
  scheduled_hours DECIMAL(4,2),
  worked_hours DECIMAL(4,2),
  break_minutes INTEGER DEFAULT 0,
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'present',
  absence_reason VARCHAR(100), 
  is_justified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para employee_shifts
CREATE INDEX IF NOT EXISTS idx_employee_shifts_date ON employee_shifts(date);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_employee ON employee_shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_shift ON employee_shifts(shift_id);

-- Índices para time_records
CREATE INDEX IF NOT EXISTS idx_time_records_employee ON time_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_records_date ON time_records(date);
CREATE INDEX IF NOT EXISTS idx_time_records_center ON time_records(center_id);

-- Índices para daily_attendance
CREATE INDEX IF NOT EXISTS idx_daily_attendance_employee ON daily_attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_date ON daily_attendance(date);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_center ON daily_attendance(center_id);

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_attendance ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo por ahora, refinar después)
CREATE POLICY "Allow all operations for authenticated users" ON shifts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON employee_shifts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON time_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON daily_attendance FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para calcular horas trabajadas
CREATE OR REPLACE FUNCTION calculate_worked_hours(clock_in TIMESTAMP, clock_out TIMESTAMP, break_mins INTEGER DEFAULT 0)
RETURNS DECIMAL(4,2) AS $$
BEGIN
  IF clock_in IS NULL OR clock_out IS NULL THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND(
    (EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600) - (break_mins / 60.0),
    2
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar total_hours en time_records
CREATE OR REPLACE FUNCTION update_time_record_hours()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_hours = calculate_worked_hours(NEW.clock_in_time, NEW.clock_out_time, NEW.break_minutes);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_time_record_hours
  BEFORE INSERT OR UPDATE ON time_records
  FOR EACH ROW
  EXECUTE FUNCTION update_time_record_hours();

-- ============================================
-- TABLA 5: SHIFT_CHANGES (Historial de Cambios)
-- ============================================
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

-- ============================================
-- TABLA 6: SHIFT_COVERAGE (Control de Cobertura)
-- ============================================
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
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para shift_changes
CREATE INDEX IF NOT EXISTS idx_shift_changes_employee ON shift_changes(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_changes_date ON shift_changes(change_date);
CREATE INDEX IF NOT EXISTS idx_shift_changes_type ON shift_changes(change_type);

-- Índices para shift_coverage
CREATE INDEX IF NOT EXISTS idx_shift_coverage_date ON shift_coverage(date);
CREATE INDEX IF NOT EXISTS idx_shift_coverage_shift ON shift_coverage(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_coverage_status ON shift_coverage(coverage_status);

-- ============================================
-- POLÍTICAS RLS ADICIONALES
-- ============================================

-- Habilitar RLS en nuevas tablas
ALTER TABLE shift_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_coverage ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Allow all operations for authenticated users" ON shift_changes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON shift_coverage FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- DATOS INICIALES - TURNOS REALES DE LA JUNGLA
-- ============================================

-- Insertar turnos reales para Sevilla (center_id = 9)
INSERT INTO shifts (name, start_time, end_time, monday, tuesday, wednesday, thursday, friday, saturday, sunday, max_employees, min_employees, is_support, description, center_id) 
VALUES 
('Apertura', '06:45', '08:00', true, true, true, true, true, true, false, 1, 1, false, 'Apertura del centro, preparación de instalaciones', 9),
('Turno Mañana', '08:00', '14:00', true, true, true, true, true, true, false, 3, 2, false, 'Turno principal de mañana', 9),
('Turno Tarde Principal', '14:00', '20:00', true, true, true, true, true, true, false, 3, 2, false, 'Turno principal de tarde', 9),
('Apoyo Tarde', '17:00', '21:00', true, true, true, true, true, true, false, 2, 1, true, 'Refuerzo en horas punta de tarde', 9),
('Cierre', '20:00', '22:15', true, true, true, true, true, true, false, 1, 1, false, 'Cierre del centro y limpieza final', 9),
('Turno Completo', '09:00', '19:00', false, false, false, false, false, true, true, 1, 1, false, 'Turno especial día completo', 9)
ON CONFLICT DO NOTHING;

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
BEGIN
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
      WHERE es2.employee_id = e.id
        AND es2.date = target_date
        AND EXISTS (
          SELECT 1 FROM shifts s
          WHERE s.id = es2.shift_id
            AND (
              (s.start_time, s.end_time) OVERLAPS (
                SELECT s2.start_time, s2.end_time 
                FROM shifts s2 
                WHERE s2.id = target_shift_id
              )
            )
        )
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
-- COMENTARIOS FINALES
-- ============================================

-- Tablas creadas exitosamente:
-- ✅ shifts: Definición de turnos por centro (ACTUALIZADA con empleados múltiples)
-- ✅ employee_shifts: Asignaciones de empleados a turnos específicos
-- ✅ time_records: Registros de fichajes (entrada/salida)
-- ✅ daily_attendance: Resumen diario de asistencia
-- ✅ shift_changes: Historial de cambios y sustituciones
-- ✅ shift_coverage: Control de cobertura de turnos

-- Funciones auxiliares:
-- ✅ calculate_monthly_hours: Calcular horas mensuales por empleado
-- ✅ find_available_substitutes: Encontrar sustitutos disponibles
-- ✅ validate_shift_coverage: Validar cobertura de turnos

-- Datos iniciales:
-- ✅ 6 turnos reales de La Jungla cargados para Sevilla

-- Próximo paso: Implementar ShiftManagementSystem.tsx completo
