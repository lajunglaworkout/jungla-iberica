-- Verificar qué tablas de revisiones existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%quarterly%'
ORDER BY table_name;

-- Ver estructura de centers
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'centers'
ORDER BY ordinal_position;

-- Ver algunos centros
SELECT * FROM centers LIMIT 5;
