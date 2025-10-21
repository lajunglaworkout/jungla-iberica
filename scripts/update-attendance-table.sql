-- Actualizar tabla de asistencia para incluir 'early_departure'
ALTER TABLE attendance_records 
DROP CONSTRAINT IF EXISTS attendance_records_type_check;

ALTER TABLE attendance_records 
ADD CONSTRAINT attendance_records_type_check 
CHECK (type IN ('late', 'sick_leave', 'absence', 'personal', 'other', 'early_departure'));

COMMENT ON COLUMN attendance_records.type IS 'Tipo: late (retraso), sick_leave (baja médica), absence (ausencia), personal (asunto personal), early_departure (salida temprana), other (otro)';
