-- Script simplificado y compatible con Supabase
-- Ejecutar paso a paso en el SQL Editor

-- PASO 1: Listar todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- PASO 2: Ver estructura básica de cada tabla
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- PASO 3: Buscar usuario Vicente
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email ILIKE '%vicente%' 
   OR raw_user_meta_data::text ILIKE '%vicente%';

-- PASO 4: Buscar tablas relacionadas con marca/ventas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND (
    table_name ILIKE '%brand%' OR
    table_name ILIKE '%marca%' OR
    table_name ILIKE '%sales%' OR
    table_name ILIKE '%lead%' OR
    table_name ILIKE '%project%' OR
    table_name ILIKE '%accounting%' OR
    table_name ILIKE '%financial%'
)
ORDER BY table_name;
