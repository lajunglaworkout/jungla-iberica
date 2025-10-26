-- Ver todas las columnas de la tabla centers
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'centers'
ORDER BY ordinal_position;

-- Ver la clave primaria de centers
SELECT tc.constraint_name, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'centers' AND tc.constraint_type = 'PRIMARY KEY';

-- Ver todos los datos de centers
SELECT * FROM centers;
