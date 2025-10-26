-- Migración: Añadir columnas de contexto de reunión a la tabla tareas
-- Fecha: 26 de Octubre 2025
-- Descripción: Añade columnas para guardar información completa de las reuniones

-- Columnas a añadir a la tabla 'tareas':
-- 1. reunion_titulo (text) - Título de la reunión de donde proviene la tarea
-- 2. reunion_participantes (text) - Participantes de la reunión (separados por comas)
-- 3. reunion_fecha (date) - Fecha de la reunión
-- 4. reunion_acta (text) - Acta completa de la reunión
-- 5. departamento (text) - Departamento responsable de la tarea

-- Ejecutar estos comandos en Supabase SQL Editor:

-- Añadir columnas a la tabla tareas
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS reunion_titulo TEXT;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS reunion_participantes TEXT;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS reunion_fecha DATE;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS reunion_acta TEXT;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS departamento TEXT;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tareas_reunion_titulo ON tareas(reunion_titulo);
CREATE INDEX IF NOT EXISTS idx_tareas_departamento ON tareas(departamento);
CREATE INDEX IF NOT EXISTS idx_tareas_reunion_fecha ON tareas(reunion_fecha);

-- Verificar que las columnas se crearon correctamente
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tareas';
