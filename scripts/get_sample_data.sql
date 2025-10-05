-- Script para obtener datos de ejemplo de las tablas principales
-- Ejecutar DESPUÉS del script anterior para obtener contexto de datos

-- 1. USUARIOS (primeros 5 registros)
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'role' as role
FROM auth.users 
LIMIT 5;

-- 2. BUSCAR USUARIO VICENTE ESPECÍFICAMENTE
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data,
    user_metadata
FROM auth.users 
WHERE email ILIKE '%vicente%' 
   OR raw_user_meta_data->>'name' ILIKE '%vicente%'
   OR user_metadata->>'name' ILIKE '%vicente%';

-- 3. DATOS DE CENTROS (si existe la tabla)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name ILIKE '%center%';

-- Si existe tabla de centros, obtener muestra
-- SELECT * FROM centers LIMIT 3;

-- 4. DATOS DE CONTABILIDAD (si existe)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND (
    table_name ILIKE '%accounting%' OR
    table_name ILIKE '%financial%' OR
    table_name ILIKE '%income%' OR
    table_name ILIKE '%expense%'
);

-- 5. DATOS DE VENTAS/LEADS (si existe)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND (
    table_name ILIKE '%sales%' OR
    table_name ILIKE '%lead%' OR
    table_name ILIKE '%contact%' OR
    table_name ILIKE '%project%'
);

-- 6. OBTENER MUESTRA DE DATOS DE TODAS LAS TABLAS PÚBLICAS
DO $$
DECLARE
    table_record RECORD;
    query_text TEXT;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    LOOP
        query_text := 'SELECT ''' || table_record.table_name || ''' as table_name, count(*) as row_count FROM ' || table_record.table_name;
        RAISE NOTICE 'Table: %, Query: %', table_record.table_name, query_text;
        -- EXECUTE query_text;
    END LOOP;
END $$;

-- 7. VERIFICAR POLÍTICAS RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
