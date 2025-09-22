-- Esquema de usuarios para La Jungla CRM
-- Ejecutar en Supabase SQL Editor

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  base_role VARCHAR(50) NOT NULL CHECK (base_role IN ('ceo', 'director', 'center_manager', 'trainer', 'employee')),
  center VARCHAR(50) NOT NULL CHECK (center IN ('central', 'sevilla', 'jerez', 'puerto')),
  assigned_modules TEXT[] DEFAULT '{}', -- Array de módulos asignados
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(base_role);
CREATE INDEX IF NOT EXISTS idx_users_center ON users(center);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos iniciales del equipo La Jungla
INSERT INTO users (name, email, base_role, center, assigned_modules, is_active) VALUES
('Carlos Suárez', 'carlossuarezparra@gmail.com', 'ceo', 'central', 
 ARRAY['logistics', 'maintenance', 'accounting', 'marketing', 'hr', 'online', 'events', 'reports'], true),

('Benito Morales', 'benito@lajungla.es', 'director', 'central', 
 ARRAY['logistics', 'maintenance', 'accounting'], true),

('Vicente Corbaón', 'vicente@lajungla.es', 'director', 'central', 
 ARRAY['hr'], true),

('Jonathan Padilla', 'jonathan@lajungla.es', 'director', 'central', 
 ARRAY['online'], true),

('Antonio Durán', 'antonio@lajungla.es', 'director', 'central', 
 ARRAY['events'], true),

('Diego Montilla', 'diego@lajungla.es', 'director', 'central', 
 ARRAY['marketing'], true),

-- Encargados de centros
('Fran Giraldez', 'fran.sevilla@lajungla.es', 'center_manager', 'sevilla', 
 ARRAY[]::TEXT[], true),

('Salva Cabrera', 'salva.sevilla@lajungla.es', 'center_manager', 'sevilla', 
 ARRAY[]::TEXT[], true),

('Iván Fernández', 'ivan.jerez@lajungla.es', 'center_manager', 'jerez', 
 ARRAY[]::TEXT[], true),

('Pablo Benítez', 'pablo.jerez@lajungla.es', 'center_manager', 'jerez', 
 ARRAY[]::TEXT[], true),

('Guillermo', 'guillermo.puerto@lajungla.es', 'center_manager', 'puerto', 
 ARRAY[]::TEXT[], true),

('Adrián', 'adrian.puerto@lajungla.es', 'center_manager', 'puerto', 
 ARRAY[]::TEXT[], true),

-- Entrenadores Sevilla
('Javier Surian', 'javier.sevilla@lajungla.es', 'trainer', 'sevilla', 
 ARRAY[]::TEXT[], true),

('Jesús Rosado', 'jesus.rosado@lajungla.es', 'trainer', 'sevilla', 
 ARRAY[]::TEXT[], true),

('Jesús Arias', 'jesus.arias@lajungla.es', 'trainer', 'sevilla', 
 ARRAY[]::TEXT[], true),

('Santi Frías', 'santi.sevilla@lajungla.es', 'trainer', 'sevilla', 
 ARRAY[]::TEXT[], true),

-- Entrenadores Jerez
('Rodri', 'rodri.jerez@lajungla.es', 'trainer', 'jerez', 
 ARRAY[]::TEXT[], true),

('Mario', 'mario.jerez@lajungla.es', 'trainer', 'jerez', 
 ARRAY[]::TEXT[], true),

('Antonio', 'antonio.jerez@lajungla.es', 'trainer', 'jerez', 
 ARRAY[]::TEXT[], true),

('Fran', 'fran.jerez@lajungla.es', 'trainer', 'jerez', 
 ARRAY[]::TEXT[], true),

-- Empleados Puerto
('José', 'jose.puerto@lajungla.es', 'employee', 'puerto', 
 ARRAY[]::TEXT[], true),

('Keko', 'keko.puerto@lajungla.es', 'employee', 'puerto', 
 ARRAY[]::TEXT[], true),

('Jonathan', 'jonathan.puerto@lajungla.es', 'employee', 'puerto', 
 ARRAY[]::TEXT[], true),

('Fran', 'fran.puerto@lajungla.es', 'employee', 'puerto', 
 ARRAY[]::TEXT[], true)

ON CONFLICT (email) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

-- Política para permitir actualización solo al CEO
CREATE POLICY "Only CEO can update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND base_role = 'ceo'
    )
  );

-- Política para permitir inserción solo al CEO
CREATE POLICY "Only CEO can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND base_role = 'ceo'
    )
  );

-- Política para permitir eliminación solo al CEO
CREATE POLICY "Only CEO can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND base_role = 'ceo'
    )
  );
