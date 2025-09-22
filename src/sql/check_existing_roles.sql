-- Consultar roles existentes para ver qué valores son válidos
-- Ejecutar en Supabase SQL Editor

SELECT DISTINCT role, base_role, name 
FROM employees 
WHERE role IS NOT NULL 
ORDER BY role;

-- También ver la definición del ENUM
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'user_role'
);
