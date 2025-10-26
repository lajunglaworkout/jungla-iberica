-- Migración 1: Añadir columnas de contexto de reunión a la tabla tareas
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
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS completada_por TEXT;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS notas_cierre TEXT;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS fecha_completada TIMESTAMP WITH TIME ZONE;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tareas_reunion_titulo ON tareas(reunion_titulo);
CREATE INDEX IF NOT EXISTS idx_tareas_departamento ON tareas(departamento);
CREATE INDEX IF NOT EXISTS idx_tareas_reunion_fecha ON tareas(reunion_fecha);

-- ============================================================
-- Migración 2: Crear tabla de notificaciones
-- Fecha: 26 de Octubre 2025
-- Descripción: Tabla para almacenar notificaciones de tareas

-- Crear tabla notifications
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL, -- 'task_assigned', 'task_completed', 'task_due_soon'
  title TEXT NOT NULL,
  message TEXT,
  task_id BIGINT REFERENCES tareas(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON notifications(task_id);

-- Verificar que las tablas se crearon correctamente
-- SELECT * FROM information_schema.tables WHERE table_name IN ('tareas', 'notifications');
