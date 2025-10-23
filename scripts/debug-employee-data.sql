-- Verificar datos completos de Francisco
SELECT 
  id,
  name,
  email,
  role,
  center_id,
  typeof(center_id) as center_id_type,
  is_active
FROM employees
WHERE email = 'franciscogiraldezmorales@gmail.com';

-- Verificar tipo de dato en la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND column_name = 'center_id';
