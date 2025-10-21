-- Tabla para gestión de documentos de empleados
CREATE TABLE IF NOT EXISTS employee_documents (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('contract', 'payroll', 'irpf', 'sick_leave', 'certificate', 'other')),
  document_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(100),
  period VARCHAR(50), -- Para nóminas: "2024-01", para IRPF: "2024"
  uploaded_by VARCHAR(255),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_documents_employee ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON employee_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_period ON employee_documents(period);

-- Comentarios
COMMENT ON TABLE employee_documents IS 'Documentos de empleados (contratos, nóminas, certificados, bajas médicas)';
COMMENT ON COLUMN employee_documents.document_type IS 'Tipo: contract (contrato), payroll (nómina), irpf (certificado IRPF), sick_leave (baja médica), certificate (certificado), other (otro)';
COMMENT ON COLUMN employee_documents.period IS 'Periodo del documento: YYYY-MM para nóminas, YYYY para IRPF anual';
