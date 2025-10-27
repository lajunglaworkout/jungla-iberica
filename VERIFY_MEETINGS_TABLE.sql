-- Verificar si la tabla meetings existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'meetings'
) AS table_exists;

-- Ver estructura de la tabla meetings
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'meetings'
ORDER BY ordinal_position;

-- Ver primeras reuniones guardadas
SELECT * FROM meetings LIMIT 5;
