-- Script para verificar existencia de tablas de fichajes
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar tabla qr_tokens
SELECT 
  'qr_tokens' as tabla,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'qr_tokens'
  ) as existe;

-- 2. Verificar tabla time_records
SELECT 
  'time_records' as tabla,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'time_records'
  ) as existe;

-- 3. Verificar tabla daily_attendance
SELECT 
  'daily_attendance' as tabla,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'daily_attendance'
  ) as existe;

-- 4. Verificar tabla shifts
SELECT 
  'shifts' as tabla,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'shifts'
  ) as existe;

-- 5. Verificar tabla employee_shifts
SELECT 
  'employee_shifts' as tabla,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'employee_shifts'
  ) as existe;

-- 6. Si existen, mostrar estructura de qr_tokens
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'qr_tokens'
ORDER BY ordinal_position;

-- 7. Si existen, mostrar estructura de time_records
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'time_records'
ORDER BY ordinal_position;

-- 8. Contar registros en cada tabla (si existen)
SELECT 
  'qr_tokens' as tabla,
  COUNT(*) as total_registros
FROM qr_tokens
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'qr_tokens'
);

SELECT 
  'time_records' as tabla,
  COUNT(*) as total_registros
FROM time_records
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'time_records'
);
