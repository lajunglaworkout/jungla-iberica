-- Migración para añadir campos de Guía Estratégica a academy_lesson_blocks
-- Ejecutar en Supabase SQL Editor

ALTER TABLE academy_lesson_blocks 
ADD COLUMN IF NOT EXISTS concepto TEXT,
ADD COLUMN IF NOT EXISTS valor TEXT,
ADD COLUMN IF NOT EXISTS accion TEXT;

-- Verificar que las columnas se añadieron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'academy_lesson_blocks' 
AND column_name IN ('concepto', 'valor', 'accion');
