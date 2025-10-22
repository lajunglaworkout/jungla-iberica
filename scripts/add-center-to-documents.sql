-- Añadir campo center_id a la tabla employee_documents
ALTER TABLE employee_documents 
ADD COLUMN IF NOT EXISTS center_id BIGINT REFERENCES centers(id);

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_documents_center ON employee_documents(center_id);

-- Comentario
COMMENT ON COLUMN employee_documents.center_id IS 'Centro o marca al que pertenece el documento';
