-- Script COMPLETO para añadir TODAS las columnas del formulario de empleados
-- Ejecutar en Supabase SQL Editor

-- Añadir todas las columnas de una vez
ALTER TABLE employees ADD COLUMN IF NOT EXISTS apellidos TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS departamento TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS numero_cuenta TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS banco TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS titulacion TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS especialidad TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS talla_camiseta TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS talla_pantalon TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS talla_chaqueton TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_chandal TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_sudadera_frio TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_chaleco_frio TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_pantalon_corto TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_polo_verde TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_camiseta_entrenamiento TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_observaciones TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tiene_contrato_firmado BOOLEAN DEFAULT false;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tiene_alta_ss BOOLEAN DEFAULT false;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tiene_formacion_riesgos BOOLEAN DEFAULT false;

-- Verificar columnas añadidas
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'employees'
ORDER BY column_name;

-- Mensaje de confirmación
SELECT '✅ TODAS las columnas han sido añadidas correctamente' as resultado;
