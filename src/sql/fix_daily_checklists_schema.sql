-- Script para corregir el esquema de daily_checklists
-- Primero verificamos si la tabla existe y qué columnas tiene

-- Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'daily_checklists';

-- Si la tabla existe pero no tiene las columnas correctas, la eliminamos y recreamos
DROP TABLE IF EXISTS daily_checklists CASCADE;

-- Crear la tabla con el esquema correcto
CREATE TABLE daily_checklists (
    id BIGSERIAL PRIMARY KEY,
    center_id TEXT NOT NULL,
    date DATE NOT NULL,
    employee_id TEXT,
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_progreso', 'apertura_firmada', 'cierre_firmado', 'completado')),
    
    -- Campos para firmas digitales
    firma_apertura JSONB,
    firma_cierre JSONB,
    
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint único para evitar duplicados
    UNIQUE(center_id, date)
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_daily_checklists_center_date ON daily_checklists(center_id, date);
CREATE INDEX idx_daily_checklists_employee ON daily_checklists(employee_id);
CREATE INDEX idx_daily_checklists_status ON daily_checklists(status);
CREATE INDEX idx_daily_checklists_date ON daily_checklists(date);

-- Comentarios para documentar la tabla
COMMENT ON TABLE daily_checklists IS 'Almacena los checklists diarios de cada centro deportivo';
COMMENT ON COLUMN daily_checklists.center_id IS 'ID del centro deportivo (ej: sevilla, jerez, puerto)';
COMMENT ON COLUMN daily_checklists.date IS 'Fecha del checklist (YYYY-MM-DD)';
COMMENT ON COLUMN daily_checklists.employee_id IS 'ID del empleado que realiza el checklist';
COMMENT ON COLUMN daily_checklists.tasks IS 'JSON con las tareas del checklist y su estado';
COMMENT ON COLUMN daily_checklists.status IS 'Estado general del checklist';

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_daily_checklists_updated_at
    BEFORE UPDATE ON daily_checklists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos datos de ejemplo para testing
INSERT INTO daily_checklists (center_id, date, employee_id, tasks, status) VALUES
('sevilla', CURRENT_DATE, 'francisco_id', '[
    {"id": "limpieza_vestuarios", "categoria": "limpieza", "descripcion": "Limpiar vestuarios", "completado": false},
    {"id": "revision_equipos", "categoria": "equipamiento", "descripcion": "Revisar estado de máquinas", "completado": false},
    {"id": "control_temperatura", "categoria": "mantenimiento", "descripcion": "Verificar temperatura aire acondicionado", "completado": false}
]'::jsonb, 'pendiente'),
('jerez', CURRENT_DATE, 'encargado_jerez', '[
    {"id": "apertura_centro", "categoria": "operaciones", "descripcion": "Abrir centro y encender sistemas", "completado": true},
    {"id": "limpieza_general", "categoria": "limpieza", "descripcion": "Limpieza general de instalaciones", "completado": false}
]'::jsonb, 'en_progreso');

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla daily_checklists creada correctamente' as resultado;
SELECT COUNT(*) as registros_ejemplo FROM daily_checklists;
