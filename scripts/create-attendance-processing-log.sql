-- Tabla para registro de procesamiento automático de asistencia
CREATE TABLE IF NOT EXISTS attendance_processing_log (
  id BIGSERIAL PRIMARY KEY,
  process_date DATE NOT NULL UNIQUE,
  center_id BIGINT,
  incidents_detected INTEGER DEFAULT 0,
  late_count INTEGER DEFAULT 0,
  absence_count INTEGER DEFAULT 0,
  early_departure_count INTEGER DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'pending')),
  error_message TEXT,
  CONSTRAINT fk_center FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_processing_log_date ON attendance_processing_log(process_date);
CREATE INDEX IF NOT EXISTS idx_processing_log_center ON attendance_processing_log(center_id);

-- Comentarios
COMMENT ON TABLE attendance_processing_log IS 'Registro de procesamiento automático diario de incidencias de asistencia';
COMMENT ON COLUMN attendance_processing_log.process_date IS 'Fecha procesada';
COMMENT ON COLUMN attendance_processing_log.incidents_detected IS 'Total de incidencias detectadas';
COMMENT ON COLUMN attendance_processing_log.status IS 'Estado del procesamiento: completed, failed, pending';

-- Función para procesar automáticamente (se puede llamar desde un cron job o trigger)
CREATE OR REPLACE FUNCTION process_daily_attendance()
RETURNS void AS $$
BEGIN
  -- Esta función se puede llamar diariamente desde un cron job externo
  -- o desde la aplicación
  RAISE NOTICE 'Procesamiento automático de asistencia ejecutado';
END;
$$ LANGUAGE plpgsql;
