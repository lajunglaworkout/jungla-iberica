-- 1. Ver todos los documentos actuales
SELECT id, employee_id, document_type, document_name, center_id, uploaded_at 
FROM employee_documents 
ORDER BY uploaded_at DESC;

-- 2. Ver cuántos documentos hay
SELECT COUNT(*) as total_documentos FROM employee_documents;

-- 3. Eliminar TODOS los documentos
DELETE FROM employee_documents;

-- 4. Verificar que se eliminaron
SELECT COUNT(*) as total_documentos_despues FROM employee_documents;

-- 5. Verificar que la tabla está vacía
SELECT * FROM employee_documents;
