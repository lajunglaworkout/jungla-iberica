-- database-incidencias.sql - Sistema de Incidencias y Peticiones
-- Crear tablas para gestión de ausencias, vacaciones y peticiones de vestuario

-- 1. Crear tabla de categorías de incidencias
CREATE TABLE IF NOT EXISTS incident_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Añadir columna category_id a incident_types si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'incident_types' AND column_name = 'category_id') THEN
        ALTER TABLE incident_types ADD COLUMN category_id BIGINT;
    END IF;
END $$;

-- 3. Añadir columnas adicionales si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'incident_types' AND column_name = 'requires_dates') THEN
        ALTER TABLE incident_types ADD COLUMN requires_dates BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'incident_types' AND column_name = 'requires_clothing_details') THEN
        ALTER TABLE incident_types ADD COLUMN requires_clothing_details BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. Tabla principal de incidencias/peticiones
CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  incident_type_id INTEGER NOT NULL REFERENCES incident_types(id),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  days_requested INTEGER,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Campos específicos para vestuario
  clothing_type VARCHAR(100),
  clothing_size VARCHAR(20),
  quantity INTEGER DEFAULT 1,
  
  -- Campos de aprobación
  approved_by INTEGER REFERENCES employees(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Metadatos
  attachments JSONB, -- URLs de archivos adjuntos
  comments JSONB, -- Historial de comentarios
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de comentarios/seguimiento
CREATE TABLE IF NOT EXISTS incident_comments (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- Solo visible para managers/hr
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insertar categorías de incidencias
INSERT INTO incident_categories (name, description, icon, color) VALUES
('Recursos Humanos', 'Ausencias, vacaciones y temas laborales', '👥', '#059669'),
('Logística', 'Vestuario, equipamiento y materiales', '📦', '#2563eb'),
('Dirección', 'Incidencias técnicas y mejoras', '🏢', '#dc2626'),
('Formación', 'Cursos, capacitaciones y desarrollo', '📚', '#ea580c')
ON CONFLICT DO NOTHING;

-- 5. Añadir columnas necesarias a incident_types
DO $$ 
BEGIN
    -- Añadir category_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'incident_types' AND column_name = 'category_id') THEN
        ALTER TABLE incident_types ADD COLUMN category_id BIGINT;
    END IF;
    
    -- Añadir requires_dates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'incident_types' AND column_name = 'requires_dates') THEN
        ALTER TABLE incident_types ADD COLUMN requires_dates BOOLEAN DEFAULT false;
    END IF;
    
    -- Añadir requires_clothing_details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'incident_types' AND column_name = 'requires_clothing_details') THEN
        ALTER TABLE incident_types ADD COLUMN requires_clothing_details BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 6. Limpiar tipos existentes y insertar los nuevos según especificaciones
DELETE FROM incident_types;

-- 7. Insertar tipos de incidencias según especificaciones del usuario
-- Usar subconsultas con LIMIT 1 para evitar múltiples filas
INSERT INTO incident_types (category_id, name, description, approver_role, requires_dates, requires_clothing_details) VALUES
-- Logística
((SELECT id FROM incident_categories WHERE name = 'Logística' LIMIT 1), 'Rotura de material', 'Rotura de material que impide realizar un entrenamiento efectivo', 'logistics', false, false),
((SELECT id FROM incident_categories WHERE name = 'Logística' LIMIT 1), 'Avería en instalaciones', 'Avería o rotura en las instalaciones del centro', 'logistics', false, false),
((SELECT id FROM incident_categories WHERE name = 'Logística' LIMIT 1), 'Llegada de material nuevo', 'Notificación de llegada de material nuevo al centro', 'logistics', false, false),
((SELECT id FROM incident_categories WHERE name = 'Logística' LIMIT 1), 'Petición de vestuario', 'Solicitud de vestuario de trabajo (camisetas, pantalones, etc.)', 'logistics', false, true),
((SELECT id FROM incident_categories WHERE name = 'Logística' LIMIT 1), 'Falta de material', 'Falta de material necesario para entrenamientos', 'logistics', false, false),
((SELECT id FROM incident_categories WHERE name = 'Logística' LIMIT 1), 'Problema con limpieza', 'Incidencias relacionadas con la limpieza del centro', 'logistics', false, false),

-- RRHH
((SELECT id FROM incident_categories WHERE name = 'Recursos Humanos' LIMIT 1), 'Incidencia en turno', 'Cualquier incidencia en su turno que deba notificar a RRHH', 'hr', false, false),
((SELECT id FROM incident_categories WHERE name = 'Recursos Humanos' LIMIT 1), 'Bajas o ausencias', 'Solicitud de bajas médicas o ausencias laborales', 'hr', true, false),
((SELECT id FROM incident_categories WHERE name = 'Recursos Humanos' LIMIT 1), 'Petición de reuniones', 'Solicitud de reunión con el departamento de RRHH', 'hr', false, false),
((SELECT id FROM incident_categories WHERE name = 'Recursos Humanos' LIMIT 1), 'Incidencia con clientes', 'Problemas o conflictos con clientes del centro', 'hr', false, false),
((SELECT id FROM incident_categories WHERE name = 'Recursos Humanos' LIMIT 1), 'Cambio de turno', 'Solicitud de cambio de turno o intercambio', 'hr', true, false),
((SELECT id FROM incident_categories WHERE name = 'Recursos Humanos' LIMIT 1), 'Problema con compañeros', 'Conflictos o problemas con otros empleados', 'hr', false, false),
((SELECT id FROM incident_categories WHERE name = 'Recursos Humanos' LIMIT 1), 'Accidente laboral', 'Reporte de accidente ocurrido durante el trabajo', 'hr', false, false),

-- Dirección
((SELECT id FROM incident_categories WHERE name = 'Dirección' LIMIT 1), 'Sugerencias', 'Sugerencias para mejorar el funcionamiento del centro', 'management', false, false),
((SELECT id FROM incident_categories WHERE name = 'Dirección' LIMIT 1), 'Propuestas de mejora', 'Propuestas específicas de mejora de procesos o servicios', 'management', false, false),
((SELECT id FROM incident_categories WHERE name = 'Dirección' LIMIT 1), 'Quejas', 'Quejas sobre procesos, condiciones de trabajo o servicios', 'management', false, false),
((SELECT id FROM incident_categories WHERE name = 'Dirección' LIMIT 1), 'Problema con proveedores', 'Incidencias relacionadas con proveedores externos', 'management', false, false),
((SELECT id FROM incident_categories WHERE name = 'Dirección' LIMIT 1), 'Incidencia de seguridad', 'Problemas de seguridad en las instalaciones', 'management', false, false),

-- Formación
((SELECT id FROM incident_categories WHERE name = 'Formación' LIMIT 1), 'Consulta sobre procedimientos', 'Dudas sobre procedimientos de trabajo o protocolos', 'hr', false, false),
((SELECT id FROM incident_categories WHERE name = 'Formación' LIMIT 1), 'Incidencia con plan de formación', 'Problemas o sugerencias sobre el plan de formación', 'hr', false, false);

-- 8. Limpiar datos inconsistentes antes de crear foreign key (ya no es necesario tras DELETE)
-- UPDATE incident_types SET category_id = NULL WHERE category_id NOT IN (SELECT id FROM incident_categories);

-- 9. Añadir foreign key constraint después de limpiar datos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'incident_types_category_id_fkey') THEN
        ALTER TABLE incident_types 
        ADD CONSTRAINT incident_types_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES incident_categories(id);
    END IF;
END $$;

-- 5. Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_incident_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para actualizar timestamp automáticamente
DROP TRIGGER IF EXISTS update_incidents_timestamp ON incidents;
CREATE TRIGGER update_incidents_timestamp
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_incident_timestamp();

-- 7. Función para calcular días laborables entre fechas
CREATE OR REPLACE FUNCTION calculate_working_days(start_date DATE, end_date DATE)
RETURNS INTEGER AS $$
DECLARE
  working_days INTEGER := 0;
  current_day DATE := start_date;
BEGIN
  WHILE current_day <= end_date LOOP
    -- Contar solo días laborables (lunes a viernes)
    IF EXTRACT(DOW FROM current_day) BETWEEN 1 AND 5 THEN
      working_days := working_days + 1;
    END IF;
    current_day := current_day + INTERVAL '1 day';
  END LOOP;
  
  RETURN working_days;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para calcular días automáticamente
CREATE OR REPLACE FUNCTION calculate_incident_days()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL THEN
    NEW.days_requested = calculate_working_days(NEW.start_date, NEW.end_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_days_trigger ON incidents;
CREATE TRIGGER calculate_days_trigger
  BEFORE INSERT OR UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION calculate_incident_days();

-- 9. Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_incidents_employee ON incidents(employee_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(incident_type_id);
CREATE INDEX IF NOT EXISTS idx_incidents_dates ON incidents(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_incident_comments_incident ON incident_comments(incident_id);

-- 10. Índices adicionales para categorías
CREATE INDEX IF NOT EXISTS idx_incident_types_category ON incident_types(category_id);

-- 11. Eliminar vista existente y recrear con nuevas columnas
DROP VIEW IF EXISTS incidents_with_details;

CREATE VIEW incidents_with_details AS
SELECT 
  i.*,
  e.name as employee_name,
  e.email as employee_email,
  e.position as employee_position,
  it.name as incident_type_name,
  it.description as incident_type_description,
  it.approver_role,
  it.requires_dates,
  it.requires_clothing_details,
  ic.name as category_name,
  ic.icon as category_icon,
  ic.color as category_color,
  approver.name as approved_by_name,
  c.name as center_name
FROM incidents i
JOIN employees e ON i.employee_id = e.id
JOIN incident_types it ON i.incident_type_id = it.id
LEFT JOIN incident_categories ic ON it.category_id = ic.id
LEFT JOIN employees approver ON i.approved_by = approver.id
LEFT JOIN centers c ON e.center_id = c.id;

COMMENT ON TABLE incidents IS 'Tabla principal para gestión de incidencias, ausencias, vacaciones y peticiones';
COMMENT ON TABLE incident_types IS 'Tipos de incidencias configurables con flujos de aprobación';
COMMENT ON TABLE incident_comments IS 'Comentarios y seguimiento de incidencias';
COMMENT ON VIEW incidents_with_details IS 'Vista optimizada con todos los detalles de incidencias';
