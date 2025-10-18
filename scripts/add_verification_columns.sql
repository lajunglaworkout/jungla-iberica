-- Script para agregar columnas de verificación a la tabla checklist_incidents
-- Ejecutar este script en el SQL Editor de Supabase

-- Agregar columnas para el sistema de verificación
ALTER TABLE checklist_incidents
ADD COLUMN IF NOT EXISTS requires_verification BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('pendiente', 'aprobada', 'rechazada')),
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS verified_by TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Actualizar el campo status para incluir los nuevos estados
-- Primero, eliminar la restricción existente si existe
ALTER TABLE checklist_incidents
DROP CONSTRAINT IF EXISTS checklist_incidents_status_check;

-- Agregar la nueva restricción con los estados adicionales
ALTER TABLE checklist_incidents
ADD CONSTRAINT checklist_incidents_status_check 
CHECK (status IN ('abierta', 'en_proceso', 'resuelta', 'cerrada', 'pendiente_verificacion', 'verificada'));

-- Crear índice para mejorar las consultas de verificación
CREATE INDEX IF NOT EXISTS idx_checklist_incidents_verification 
ON checklist_incidents(verification_status, reporter_name);

-- Comentarios para documentación
COMMENT ON COLUMN checklist_incidents.requires_verification IS 'Indica si la incidencia requiere verificación del empleado que la reportó';
COMMENT ON COLUMN checklist_incidents.verification_status IS 'Estado de verificación: pendiente, aprobada, rechazada';
COMMENT ON COLUMN checklist_incidents.verification_notes IS 'Comentarios del empleado sobre la resolución';
COMMENT ON COLUMN checklist_incidents.verified_by IS 'Nombre del empleado que verificó la resolución';
COMMENT ON COLUMN checklist_incidents.verified_at IS 'Fecha y hora de verificación';
COMMENT ON COLUMN checklist_incidents.rejection_reason IS 'Razón por la que se rechazó la resolución';

-- Mostrar el esquema actualizado
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'checklist_incidents'
ORDER BY ordinal_position;
