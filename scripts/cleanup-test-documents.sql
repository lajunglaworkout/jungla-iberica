-- Eliminar todos los documentos de prueba
DELETE FROM employee_documents;

-- Verificar que se eliminaron
SELECT COUNT(*) as total_documentos FROM employee_documents;

-- Resultado esperado: 0
