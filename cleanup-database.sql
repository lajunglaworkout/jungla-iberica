-- Script para limpiar base de datos y corregir errores
-- Ejecutar en Supabase SQL Editor

-- 1. ELIMINAR DATOS DE PRUEBA
DELETE FROM employee_shifts;
DELETE FROM shifts;

-- 2. ELIMINAR TABLAS PROBLEMÁTICAS
DROP TABLE IF EXISTS employee_shifts;

-- 3. RECREAR TABLA employee_shifts CON FOREIGN KEY CORRECTA
CREATE TABLE employee_shifts (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    shift_id BIGINT NOT NULL REFERENCES shifts(id),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREAR ÍNDICES
CREATE INDEX idx_employee_shifts_employee_id ON employee_shifts(employee_id);
CREATE INDEX idx_employee_shifts_shift_id ON employee_shifts(shift_id);
CREATE INDEX idx_employee_shifts_date ON employee_shifts(date);

-- 5. HABILITAR RLS
ALTER TABLE employee_shifts ENABLE ROW LEVEL SECURITY;

-- 6. CREAR POLÍTICA RLS
CREATE POLICY "Allow all operations for authenticated users" 
ON employee_shifts FOR ALL 
USING (auth.role() = 'authenticated');

-- 7. VERIFICAR TIPO DE ID EN TABLA EMPLOYEES
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'employees' AND column_name = 'id';

-- 8. SI employees.id ES BIGINT, USAR ESTA ESTRUCTURA:
-- DROP TABLE IF EXISTS employee_shifts;
-- CREATE TABLE employee_shifts (
--     id BIGSERIAL PRIMARY KEY,
--     employee_id BIGINT NOT NULL REFERENCES employees(id),
--     shift_id BIGINT NOT NULL REFERENCES shifts(id),
--     date DATE NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
