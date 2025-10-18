-- Verificar que la columna employee_id existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'qr_tokens' 
ORDER BY ordinal_position;

-- Refrescar el esquema de PostgREST (esto fuerza la actualización del caché)
NOTIFY pgrst, 'reload schema';

-- También puedes probar este comando alternativo
SELECT pg_notify('pgrst', 'reload schema');
