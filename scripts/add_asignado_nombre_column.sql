-- Script para añadir columna asignado_nombre a la tabla tareas
-- Esta columna guarda el nombre del empleado para referencia
-- mientras que asignado_a guarda el email para filtrado

-- Añadir columna si no existe
ALTER TABLE tareas 
ADD COLUMN IF NOT EXISTS asignado_nombre TEXT;

-- Comentario de la columna
COMMENT ON COLUMN tareas.asignado_nombre IS 'Nombre del empleado asignado (para referencia visual)';

-- Verificar que se añadió correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tareas' 
  AND column_name IN ('asignado_a', 'asignado_nombre')
ORDER BY column_name;
