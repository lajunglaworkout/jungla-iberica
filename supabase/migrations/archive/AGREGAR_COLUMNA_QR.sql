-- Agregar columna employee_id a la tabla qr_tokens
ALTER TABLE qr_tokens 
ADD COLUMN employee_id TEXT NULL;

-- Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'qr_tokens' 
ORDER BY ordinal_position;
