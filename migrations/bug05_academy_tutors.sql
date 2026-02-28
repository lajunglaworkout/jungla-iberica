-- BUG-05: Crear tabla academy_tutors si no existe
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- Esto resuelve el error de carga en el módulo Academy

CREATE TABLE IF NOT EXISTS academy_tutors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  specialty VARCHAR(255),
  bio TEXT,
  photo_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  hire_date DATE DEFAULT CURRENT_DATE,
  certifications TEXT[],
  rating DECIMAL(3,2) DEFAULT 0,
  total_courses INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índice para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_academy_tutors_status ON academy_tutors(status);
CREATE INDEX IF NOT EXISTS idx_academy_tutors_email ON academy_tutors(email);

-- Habilitar RLS
ALTER TABLE academy_tutors ENABLE ROW LEVEL SECURITY;

-- Política básica: autenticados pueden leer
CREATE POLICY "Authenticated users can read tutors"
  ON academy_tutors FOR SELECT
  TO authenticated
  USING (true);

-- Política: solo admins pueden modificar
CREATE POLICY "Admins can manage tutors"
  ON academy_tutors FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
