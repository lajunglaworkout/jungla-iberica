-- Script para crear turnos por defecto en La Jungla
-- Ejecutar en Supabase SQL Editor

-- Verificar si existen turnos
SELECT COUNT(*) as total_shifts FROM shifts;

-- Crear turnos estándar para los 3 centros
INSERT INTO shifts (name, start_time, end_time, monday, tuesday, wednesday, thursday, friday, saturday, sunday, max_employees, min_employees, center_id, description)
VALUES 
-- TURNOS PARA SEVILLA (center_id = 9)
('Apertura', '06:45', '08:00', true, true, true, true, true, false, false, 1, 1, 9, 'Apertura del centro y preparación'),
('Mañana Temprano', '08:00', '14:00', true, true, true, true, true, true, false, 2, 2, 9, 'Turno principal de mañana'),
('Mañana Completo', '09:00', '15:00', true, true, true, true, true, true, false, 1, 1, 9, 'Turno mañana completo'),
('Tarde Principal', '14:00', '20:00', true, true, true, true, true, true, false, 3, 2, 9, 'Turno principal de tarde'),
('Apoyo Tarde', '17:00', '21:00', true, true, true, true, true, false, false, 2, 1, 9, 'Refuerzo horas punta'),
('Cierre', '20:00', '22:15', true, true, true, true, true, true, false, 1, 1, 9, 'Cierre y limpieza final'),
('Sábado Mañana', '09:00', '14:00', false, false, false, false, false, true, false, 2, 2, 9, 'Turno especial sábado'),

-- TURNOS PARA JEREZ (center_id = 10) - Misma estructura
('Apertura', '06:45', '08:00', true, true, true, true, true, false, false, 1, 1, 10, 'Apertura del centro y preparación'),
('Mañana Temprano', '08:00', '14:00', true, true, true, true, true, true, false, 2, 2, 10, 'Turno principal de mañana'),
('Tarde Principal', '14:00', '20:00', true, true, true, true, true, true, false, 3, 2, 10, 'Turno principal de tarde'),
('Apoyo Tarde', '17:00', '21:00', true, true, true, true, true, false, false, 2, 1, 10, 'Refuerzo horas punta'),
('Cierre', '20:00', '22:15', true, true, true, true, true, true, false, 1, 1, 10, 'Cierre y limpieza final'),

-- TURNOS PARA PUERTO (center_id = 11)
('Apertura', '06:45', '08:00', true, true, true, true, true, false, false, 1, 1, 11, 'Apertura del centro y preparación'),
('Mañana Temprano', '08:00', '14:00', true, true, true, true, true, true, false, 2, 2, 11, 'Turno principal de mañana'),
('Tarde Principal', '14:00', '20:00', true, true, true, true, true, true, false, 3, 2, 11, 'Turno principal de tarde'),
('Cierre', '20:00', '22:15', true, true, true, true, true, true, false, 1, 1, 11, 'Cierre y limpieza final');

-- Verificar que se crearon correctamente
SELECT s.*, c.name as centro 
FROM shifts s
JOIN centers c ON s.center_id = c.id
ORDER BY c.name, s.start_time;

-- Crear tabla employee_shifts si no existe
CREATE TABLE IF NOT EXISTS employee_shifts (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(255) NOT NULL,
    shift_id BIGINT NOT NULL REFERENCES shifts(id),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_employee_shifts_employee_id ON employee_shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_shift_id ON employee_shifts(shift_id);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_date ON employee_shifts(date);

-- Asignaciones de ejemplo para Sevilla
INSERT INTO employee_shifts (employee_id, shift_id, date)
SELECT 
    e.id,
    s.id,
    '2024-01-01'
FROM employees e
JOIN shifts s ON s.center_id = e.center_id
WHERE e.center_id = 9 
  AND e.is_active = true
  AND s.name IN ('Mañana Temprano', 'Tarde Principal', 'Cierre')
LIMIT 6;

-- Verificar asignaciones creadas
SELECT 
    e.name as empleado,
    s.name as turno,
    s.start_time,
    s.end_time,
    c.name as centro
FROM employee_shifts es
JOIN employees e ON e.id::VARCHAR = es.employee_id
JOIN shifts s ON s.id = es.shift_id
JOIN centers c ON c.id = s.center_id
ORDER BY c.name, s.start_time;
