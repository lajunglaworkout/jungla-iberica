-- Script para crear la tabla de solicitudes de vacaciones
-- Ejecutar en Supabase SQL Editor

-- Crear tabla vacation_requests
CREATE TABLE IF NOT EXISTS vacation_requests (
    id BIGSERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Campos de auditoría
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    comments TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_vacation_requests_employee ON vacation_requests(employee_id);
CREATE INDEX idx_vacation_requests_status ON vacation_requests(status);
CREATE INDEX idx_vacation_requests_dates ON vacation_requests(start_date, end_date);

-- Comentarios para documentar la tabla
COMMENT ON TABLE vacation_requests IS 'Solicitudes de vacaciones de los empleados';
COMMENT ON COLUMN vacation_requests.employee_id IS 'ID del empleado que solicita';
COMMENT ON COLUMN vacation_requests.status IS 'Estado de la solicitud: pending, approved, rejected';
COMMENT ON COLUMN vacation_requests.days_requested IS 'Número de días solicitados';

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_vacation_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_vacation_requests_updated_at
    BEFORE UPDATE ON vacation_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_vacation_requests_updated_at();

-- Insertar algunos datos de ejemplo
INSERT INTO vacation_requests (employee_id, employee_name, start_date, end_date, days_requested, reason, status) VALUES
('francisco_id', 'Francisco Giráldez', '2025-07-15', '2025-07-25', 11, 'Vacaciones de verano con familia', 'approved'),
('francisco_id', 'Francisco Giráldez', '2025-12-23', '2025-12-30', 8, 'Vacaciones de Navidad', 'pending'),
('empleado_test', 'Juan Pérez', '2025-08-01', '2025-08-10', 10, 'Vacaciones de agosto', 'pending');

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla vacation_requests creada correctamente' as resultado;
SELECT COUNT(*) as registros_ejemplo FROM vacation_requests;
