-- Script para verificar y añadir columnas faltantes en la tabla employees
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar columnas actuales
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY ordinal_position;

-- 2. Añadir columna 'apellidos' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'apellidos'
    ) THEN
        ALTER TABLE employees ADD COLUMN apellidos TEXT;
        RAISE NOTICE 'Columna apellidos añadida';
    ELSE
        RAISE NOTICE 'Columna apellidos ya existe';
    END IF;
END $$;

-- 3. Verificar otras columnas que podrían faltar
DO $$ 
BEGIN
    -- Vestuario La Jungla
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_chandal') THEN
        ALTER TABLE employees ADD COLUMN vestuario_chandal TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_sudadera_frio') THEN
        ALTER TABLE employees ADD COLUMN vestuario_sudadera_frio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_chaleco_frio') THEN
        ALTER TABLE employees ADD COLUMN vestuario_chaleco_frio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_pantalon_corto') THEN
        ALTER TABLE employees ADD COLUMN vestuario_pantalon_corto TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_polo_verde') THEN
        ALTER TABLE employees ADD COLUMN vestuario_polo_verde TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_camiseta_entrenamiento') THEN
        ALTER TABLE employees ADD COLUMN vestuario_camiseta_entrenamiento TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_observaciones') THEN
        ALTER TABLE employees ADD COLUMN vestuario_observaciones TEXT;
    END IF;
END $$;

-- 4. Verificar resultado
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND column_name IN ('apellidos', 'vestuario_chandal', 'vestuario_sudadera_frio', 'vestuario_chaleco_frio', 'vestuario_pantalon_corto', 'vestuario_polo_verde', 'vestuario_camiseta_entrenamiento', 'vestuario_observaciones')
ORDER BY column_name;

-- 5. Mensaje final
DO $$ 
BEGIN
    RAISE NOTICE '✅ Verificación y corrección de tabla employees completada';
END $$;
