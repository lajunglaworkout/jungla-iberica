-- Tabla para registros de asistencia (retrasos, ausencias, bajas)
CREATE TABLE IF NOT EXISTS attendance_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('late', 'sick_leave', 'absence', 'personal', 'other')),
  hours_late DECIMAL(4,2),
  reason TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_type ON attendance_records(type);

-- Comentarios
COMMENT ON TABLE attendance_records IS 'Registros de incidencias de asistencia (retrasos, ausencias, bajas médicas)';
COMMENT ON COLUMN attendance_records.type IS 'Tipo: late (retraso), sick_leave (baja médica), absence (ausencia), personal (asunto personal), other (otro)';
COMMENT ON COLUMN attendance_records.hours_late IS 'Horas de retraso (solo para tipo late)';
