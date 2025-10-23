-- Script para verificar tablas de revisiones trimestrales
-- Fecha: 2025-10-23

-- 1. Verificar si existen las tablas necesarias
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%review%' OR table_name LIKE '%inspection%' OR table_name LIKE '%quarterly%'
ORDER BY table_name;

-- 2. Ver estructura de tablas relacionadas con inventario
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%inventory%' OR table_name LIKE '%maintenance%')
ORDER BY table_name;

-- 3. Buscar tablas que puedan contener revisiones
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (column_name LIKE '%review%' OR column_name LIKE '%inspection%' OR column_name LIKE '%quarter%')
ORDER BY table_name, ordinal_position;
