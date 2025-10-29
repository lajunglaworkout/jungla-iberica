-- Script para añadir columnas de completación de tareas
-- Fecha: 27 de Octubre 2025
-- Descripción: Añade columnas necesarias para el sistema de completación de tareas

-- Verificar columnas existentes antes de añadir
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tareas'
AND column_name IN ('completada_por', 'notas_cierre', 'fecha_completada')
ORDER BY column_name;

-- Añadir columnas para completación de tareas
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS completada_por TEXT;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS notas_cierre TEXT;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS fecha_completada DATE;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tareas_completada_por ON tareas(completada_por);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_completada ON tareas(fecha_completada);
CREATE INDEX IF NOT EXISTS idx_tareas_estado_completada ON tareas(estado) WHERE estado = 'completada';

-- Verificar que las columnas se añadieron correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tareas'
AND column_name IN ('completada_por', 'notas_cierre', 'fecha_completada')
ORDER BY column_name;

-- Mostrar estructura completa de la tabla tareas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tareas'
ORDER BY ordinal_position;

-- Comentarios sobre las nuevas columnas
COMMENT ON COLUMN tareas.completada_por IS 'Email del usuario que marcó la tarea como completada';
COMMENT ON COLUMN tareas.notas_cierre IS 'Notas de justificación al completar la tarea';
COMMENT ON COLUMN tareas.fecha_completada IS 'Fecha en que se completó la tarea';
