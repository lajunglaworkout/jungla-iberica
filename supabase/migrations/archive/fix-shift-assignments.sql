-- Script para arreglar el sistema de asignación de turnos
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla employee_shifts si no existe
CREATE TABLE IF NOT EXISTS employee_shifts (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    shift_id BIGINT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, shift_id, date)
);

-- 2. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_employee_shifts_employee_id ON employee_shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_shift_id ON employee_shifts(shift_id);
CREATE INDEX IF NOT EXISTS idx_employee_shifts_date ON employee_shifts(date);

-- 3. Habilitar RLS
ALTER TABLE employee_shifts ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes que puedan causar problemas
DROP POLICY IF EXISTS "employee_shifts_select_policy" ON employee_shifts;
DROP POLICY IF EXISTS "employee_shifts_insert_policy" ON employee_shifts;
DROP POLICY IF EXISTS "employee_shifts_update_policy" ON employee_shifts;
DROP POLICY IF EXISTS "employee_shifts_delete_policy" ON employee_shifts;

-- 5. Crear políticas RLS permisivas para usuarios autenticados
CREATE POLICY "employee_shifts_select_policy" ON employee_shifts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "employee_shifts_insert_policy" ON employee_shifts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "employee_shifts_update_policy" ON employee_shifts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "employee_shifts_delete_policy" ON employee_shifts
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Verificar que las tablas shifts y employees existen
-- Si no existen, crearlas con estructura básica

CREATE TABLE IF NOT EXISTS shifts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    center_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    center_id BIGINT,
    role VARCHAR(255) DEFAULT 'Empleado',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Habilitar RLS en shifts y employees si no está habilitado
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 8. Crear políticas básicas para shifts y employees
DROP POLICY IF EXISTS "shifts_select_policy" ON shifts;
CREATE POLICY "shifts_select_policy" ON shifts
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "employees_select_policy" ON employees;
CREATE POLICY "employees_select_policy" ON employees
    FOR SELECT USING (auth.role() = 'authenticated');

-- 9. Insertar datos de prueba si las tablas están vacías
INSERT INTO shifts (name, start_time, end_time, center_id) 
SELECT 'Turno Mañana', '08:00', '16:00', 1
WHERE NOT EXISTS (SELECT 1 FROM shifts WHERE name = 'Turno Mañana');

INSERT INTO shifts (name, start_time, end_time, center_id) 
SELECT 'Turno Tarde', '16:00', '00:00', 1
WHERE NOT EXISTS (SELECT 1 FROM shifts WHERE name = 'Turno Tarde');

INSERT INTO employees (name, email, center_id, role, is_active) 
SELECT 'Salvador Test', 'salvador@test.com', 1, 'Empleado', true
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name = 'Salvador Test');

-- 10. Verificar estructura final
SELECT 'employee_shifts table created' as status;
SELECT COUNT(*) as shifts_count FROM shifts;
SELECT COUNT(*) as employees_count FROM employees;
SELECT COUNT(*) as assignments_count FROM employee_shifts;
