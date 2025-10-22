-- Primero verificar la estructura de la tabla centers
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'centers' 
ORDER BY ordinal_position;

-- Insertar centro de Marca Corporativa (sin columnas que no existen)
INSERT INTO centers (name)
VALUES ('La Jungla - Marca Corporativa')
ON CONFLICT DO NOTHING;

-- Verificar que se creó
SELECT * FROM centers WHERE name LIKE '%Marca%' OR name LIKE '%Corporativa%';
