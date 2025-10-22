-- Ver la estructura actual de employee_documents
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'employee_documents'
ORDER BY ordinal_position;

-- Ver el tipo de dato de employee_id en la tabla employees
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'employees' AND column_name = 'id';

-- Si employee_id es BIGINT pero employees.id es UUID, necesitamos cambiar:
ALTER TABLE employee_documents 
ALTER COLUMN employee_id TYPE UUID USING employee_id::text::uuid;

-- O si es al revés, cambiar la foreign key
ALTER TABLE employee_documents
DROP CONSTRAINT IF EXISTS fk_employee;

ALTER TABLE employee_documents
ADD CONSTRAINT fk_employee 
FOREIGN KEY (employee_id) 
REFERENCES employees(id) 
ON DELETE CASCADE;
