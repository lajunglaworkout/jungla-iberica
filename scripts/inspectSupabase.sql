-- 🔍 SCRIPT PARA INSPECCIONAR ESTRUCTURA DE SUPABASE
-- Ejecutar en: Supabase Dashboard > SQL Editor

-- 1️⃣ VER TODAS LAS TABLAS
SELECT 
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as num_columns
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2️⃣ VER ESTRUCTURA DETALLADA DE CADA TABLA
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3️⃣ CONTAR REGISTROS EN CADA TABLA
SELECT 
  schemaname,
  tablename,
  (SELECT count(*) FROM information_schema.tables WHERE table_schema = schemaname AND table_name = tablename) as num_columns,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4️⃣ VER TODAS LAS TABLAS CON CANTIDAD DE REGISTROS
SELECT 
  t.table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as columns,
  (SELECT count(*) FROM pg_class WHERE relname = t.table_name) as exists
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- 5️⃣ VER ESTRUCTURA DE TABLA ESPECÍFICA (cambiar 'employees' por el nombre de la tabla)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'employees'
ORDER BY ordinal_position;

-- 6️⃣ VER PRIMERAS FILAS DE CADA TABLA (para verificar datos)
-- Employees
SELECT * FROM employees LIMIT 5;

-- Meetings (si existe)
SELECT * FROM meetings LIMIT 5;

-- Reuniones (si existe)
SELECT * FROM reuniones LIMIT 5;

-- Tasks (si existe)
SELECT * FROM tareas LIMIT 5;

-- 7️⃣ CREAR TABLA DE REUNIONES (si no existe)
CREATE TABLE IF NOT EXISTS meetings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'weekly',
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  duration_minutes INTEGER,
  participants TEXT[] DEFAULT '{}',
  leader_email VARCHAR(255),
  agenda TEXT,
  objectives TEXT[],
  kpis JSONB,
  tasks JSONB,
  notes TEXT,
  summary TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  CONSTRAINT meetings_status_check CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

-- 8️⃣ CREAR TABLA DE GRABACIONES DE REUNIONES (si no existe)
CREATE TABLE IF NOT EXISTS meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id BIGINT REFERENCES meetings(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcript TEXT,
  meeting_minutes TEXT,
  tasks_assigned JSONB,
  status VARCHAR(50) DEFAULT 'completed',
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT recording_status_check CHECK (status IN ('recording', 'processing', 'completed', 'error'))
);

-- 9️⃣ CREAR TABLA DE TAREAS (si no existe)
CREATE TABLE IF NOT EXISTS tareas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  asignado_a VARCHAR(255) NOT NULL,
  departamento_responsable VARCHAR(100),
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
  prioridad VARCHAR(50) DEFAULT 'media',
  fecha_limite DATE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_completacion TIMESTAMP WITH TIME ZONE,
  creado_por VARCHAR(255),
  reunion_id BIGINT REFERENCES meetings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT task_status_check CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
  CONSTRAINT task_priority_check CHECK (prioridad IN ('baja', 'media', 'alta', 'critica'))
);

-- 🔟 CREAR ÍNDICES PARA MEJOR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_meetings_department ON meetings(department);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_tareas_asignado ON tareas(asignado_a);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_departamento ON tareas(departamento_responsable);
CREATE INDEX IF NOT EXISTS idx_recording_meeting ON meeting_recordings(meeting_id);

-- 1️⃣1️⃣ HABILITAR RLS (Row Level Security) SI ES NECESARIO
-- ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;

-- 1️⃣2️⃣ VER TODAS LAS TABLAS CREADAS
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
