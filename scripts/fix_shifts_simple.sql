-- PASO 1: Añadir columnas a shifts
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS published_by TEXT;

-- PASO 2: Crear tabla holidays
CREATE TABLE IF NOT EXISTS holidays (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  center_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, center_id)
);

-- PASO 3: Insertar festivos
INSERT INTO holidays (name, date, type) VALUES
  ('Año Nuevo', '2025-01-01', 'national'),
  ('Reyes', '2025-01-06', 'national'),
  ('Viernes Santo', '2025-04-18', 'national'),
  ('Trabajo', '2025-05-01', 'national'),
  ('Asunción', '2025-08-15', 'national'),
  ('Fiesta Nacional', '2025-10-12', 'national'),
  ('Todos Santos', '2025-11-01', 'national'),
  ('Constitución', '2025-12-06', 'national'),
  ('Inmaculada', '2025-12-08', 'national'),
  ('Navidad', '2025-12-25', 'national'),
  ('Andalucía', '2025-02-28', 'regional'),
  ('Jueves Santo', '2025-04-17', 'regional')
ON CONFLICT DO NOTHING;

-- PASO 4: Crear tabla notificaciones
CREATE TABLE IF NOT EXISTS shift_notifications (
  id BIGSERIAL PRIMARY KEY,
  shift_id BIGINT,
  employee_id TEXT,
  employee_email TEXT,
  notification_type TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 5: Actualizar turnos existentes
UPDATE shifts SET status = 'published' WHERE status IS NULL;
