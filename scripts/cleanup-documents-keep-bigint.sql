-- La tabla employee_documents usa employee_id como BIGINT
-- La tabla employees usa id como BIGINT
-- Esto es correcto, solo necesitamos limpiar los datos

-- 1. Ver estructura actual
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'employee_documents' AND column_name = 'employee_id';

-- 2. Limpiar datos de prueba
DELETE FROM employee_documents;

-- 3. Verificar que la foreign key existe
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'employee_documents' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- 4. Si no existe la FK, crearla
ALTER TABLE employee_documents
DROP CONSTRAINT IF EXISTS fk_employee;

ALTER TABLE employee_documents
ADD CONSTRAINT fk_employee 
FOREIGN KEY (employee_id) 
REFERENCES employees(id) 
ON DELETE CASCADE;

-- Resultado esperado: employee_id es BIGINT y apunta a employees(id) BIGINT
