-- ============================================
-- ESQUEMA DE BASE DE DATOS - TURNOS Y FICHAJES
-- La Jungla Ibérica CRM
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ============================================

-- ============================================
-- TABLA 1: SHIFTS (Turnos)
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
-- COMENTARIOS FINALES
-- ============================================

-- Tablas creadas exitosamente:
-- ✅ shifts: Definición de turnos por centro
-- ✅ employee_shifts: Asignaciones de empleados a turnos específicos
-- ✅ time_records: Registros de fichajes (entrada/salida)
-- ✅ daily_attendance: Resumen diario de asistencia

-- Próximo paso: Crear componente ShiftManagementSystem.tsx
