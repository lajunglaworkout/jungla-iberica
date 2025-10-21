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

-- 3. Añadir TODAS las columnas que podrían faltar
DO $$ 
BEGIN
    -- Datos bancarios
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'banco') THEN
        ALTER TABLE employees ADD COLUMN banco TEXT;
        RAISE NOTICE 'Columna banco añadida';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'iban') THEN
        ALTER TABLE employees ADD COLUMN iban TEXT;
        RAISE NOTICE 'Columna iban añadida';
    END IF;
    
    -- Datos académicos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'titulacion') THEN
        ALTER TABLE employees ADD COLUMN titulacion TEXT;
        RAISE NOTICE 'Columna titulacion añadida';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'especialidad') THEN
        ALTER TABLE employees ADD COLUMN especialidad TEXT;
        RAISE NOTICE 'Columna especialidad añadida';
    END IF;
    
    -- Tallas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'talla_chaqueton') THEN
        ALTER TABLE employees ADD COLUMN talla_chaqueton TEXT;
        RAISE NOTICE 'Columna talla_chaqueton añadida';
    END IF;
    
    -- Vestuario La Jungla
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_chandal') THEN
        ALTER TABLE employees ADD COLUMN vestuario_chandal TEXT;
        RAISE NOTICE 'Columna vestuario_chandal añadida';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_sudadera_frio') THEN
        ALTER TABLE employees ADD COLUMN vestuario_sudadera_frio TEXT;
        RAISE NOTICE 'Columna vestuario_sudadera_frio añadida';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_chaleco_frio') THEN
        ALTER TABLE employees ADD COLUMN vestuario_chaleco_frio TEXT;
        RAISE NOTICE 'Columna vestuario_chaleco_frio añadida';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_pantalon_corto') THEN
        ALTER TABLE employees ADD COLUMN vestuario_pantalon_corto TEXT;
        RAISE NOTICE 'Columna vestuario_pantalon_corto añadida';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_polo_verde') THEN
        ALTER TABLE employees ADD COLUMN vestuario_polo_verde TEXT;
        RAISE NOTICE 'Columna vestuario_polo_verde añadida';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_camiseta_entrenamiento') THEN
        ALTER TABLE employees ADD COLUMN vestuario_camiseta_entrenamiento TEXT;
        RAISE NOTICE 'Columna vestuario_camiseta_entrenamiento añadida';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'vestuario_observaciones') THEN
        ALTER TABLE employees ADD COLUMN vestuario_observaciones TEXT;
        RAISE NOTICE 'Columna vestuario_observaciones añadida';
    END IF;
END $$;

-- 4. Verificar resultado
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND column_name IN ('apellidos', 'banco', 'iban', 'titulacion', 'especialidad', 'talla_chaqueton', 'vestuario_chandal', 'vestuario_sudadera_frio', 'vestuario_chaleco_frio', 'vestuario_pantalon_corto', 'vestuario_polo_verde', 'vestuario_camiseta_entrenamiento', 'vestuario_observaciones')
ORDER BY column_name;

-- 5. Mensaje final
DO $$ 
BEGIN
    RAISE NOTICE '✅ Verificación y corrección de tabla employees completada';
END $$;
