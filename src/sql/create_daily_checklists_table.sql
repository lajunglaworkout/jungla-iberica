-- Crear tabla daily_checklists para el sistema de checklist
-- Esta tabla almacena los checklists diarios de cada centro

CREATE TABLE IF NOT EXISTS daily_checklists (
    id BIGSERIAL PRIMARY KEY,
    center_id TEXT NOT NULL,
    date DATE NOT NULL,
    employee_id TEXT,
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_progreso', 'completado')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índices para optimizar consultas
    UNIQUE(center_id, date)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_daily_checklists_center_date ON daily_checklists(center_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_checklists_employee ON daily_checklists(employee_id);
CREATE INDEX IF NOT EXISTS idx_daily_checklists_status ON daily_checklists(status);

-- Comentarios para documentar la tabla
COMMENT ON TABLE daily_checklists IS 'Almacena los checklists diarios de cada centro deportivo';
COMMENT ON COLUMN daily_checklists.center_id IS 'ID del centro deportivo';
COMMENT ON COLUMN daily_checklists.date IS 'Fecha del checklist';
COMMENT ON COLUMN daily_checklists.employee_id IS 'ID del empleado que realiza el checklist';
COMMENT ON COLUMN daily_checklists.tasks IS 'JSON con las tareas del checklist y su estado';
COMMENT ON COLUMN daily_checklists.status IS 'Estado general del checklist: pendiente, en_progreso, completado';
COMMENT ON COLUMN daily_checklists.completed_at IS 'Fecha y hora de finalización del checklist';

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_daily_checklists_updated_at ON daily_checklists;
CREATE TRIGGER update_daily_checklists_updated_at
    BEFORE UPDATE ON daily_checklists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
