-- Script para obtener todas las tablas y su estructura en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- 1. LISTAR TODAS LAS TABLAS DEL ESQUEMA PUBLIC
SELECT 
    table_name,
    table_type,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. OBTENER ESTRUCTURA DETALLADA DE CADA TABLA
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    c.character_maximum_length,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
        ELSE ''
    END as key_type
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- 3. CONTAR REGISTROS EN CADA TABLA (versión compatible)
SELECT 
    table_name,
    'Usar COUNT manual' as note
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4. OBTENER ÍNDICES Y CONSTRAINTS
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 5. BUSCAR TABLAS RELACIONADAS CON GESTIÓN DE MARCA
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    table_name ILIKE '%brand%' OR
    table_name ILIKE '%marca%' OR
    table_name ILIKE '%sales%' OR
    table_name ILIKE '%ventas%' OR
    table_name ILIKE '%lead%' OR
    table_name ILIKE '%proyecto%' OR
    table_name ILIKE '%project%' OR
    table_name ILIKE '%accounting%' OR
    table_name ILIKE '%contabilidad%' OR
    column_name ILIKE '%brand%' OR
    column_name ILIKE '%marca%'
)
ORDER BY table_name, column_name;
