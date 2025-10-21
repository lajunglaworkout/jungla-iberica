-- Script DEFINITIVO: Añadir TODAS las columnas del formulario de empleados
-- Basado en EmployeeForm.tsx - Ejecutar en Supabase SQL Editor

-- DATOS PERSONALES
ALTER TABLE employees ADD COLUMN IF NOT EXISTS apellidos TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS ciudad TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS codigo_postal TEXT;

-- DATOS LABORALES
ALTER TABLE employees ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS departamento TEXT;

-- DATOS BANCARIOS
ALTER TABLE employees ADD COLUMN IF NOT EXISTS numero_cuenta TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS banco TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS iban TEXT;

-- FORMACIÓN/ACADÉMICO
ALTER TABLE employees ADD COLUMN IF NOT EXISTS titulacion TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS especialidad TEXT;

-- TALLAS
ALTER TABLE employees ADD COLUMN IF NOT EXISTS talla_camiseta TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS talla_pantalon TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS talla_chaqueton TEXT;

-- VESTUARIO LA JUNGLA
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_chandal TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_sudadera_frio TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_chaleco_frio TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_pantalon_corto TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_polo_verde TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_camiseta_entrenamiento TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS vestuario_observaciones TEXT;

-- DOCUMENTOS Y OBSERVACIONES
ALTER TABLE employees ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tiene_contrato_firmado BOOLEAN DEFAULT false;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tiene_alta_ss BOOLEAN DEFAULT false;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tiene_formacion_riesgos BOOLEAN DEFAULT false;

-- VERIFICAR TODAS LAS COLUMNAS
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'employees'
ORDER BY column_name;

-- MENSAJE FINAL
SELECT '✅ ESQUEMA COMPLETO DE EMPLEADOS ACTUALIZADO - 27 COLUMNAS AÑADIDAS' as resultado;
