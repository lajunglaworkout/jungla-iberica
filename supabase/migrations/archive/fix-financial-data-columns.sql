-- Script para añadir columnas faltantes a la tabla financial_data
-- Ejecutar en Supabase SQL Editor

-- Añadir columnas que faltan en financial_data
ALTER TABLE financial_data ADD COLUMN IF NOT EXISTS royalty DECIMAL(10,2) DEFAULT 0;
ALTER TABLE financial_data ADD COLUMN IF NOT EXISTS software_gestion DECIMAL(10,2) DEFAULT 0;

-- Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'financial_data' 
ORDER BY ordinal_position;
