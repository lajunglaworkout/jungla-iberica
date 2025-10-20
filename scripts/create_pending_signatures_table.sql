-- Crear tabla para firmas pendientes
CREATE TABLE IF NOT EXISTS pending_signatures (
  id BIGSERIAL PRIMARY KEY,
  signature_id TEXT UNIQUE NOT NULL,
  center_id TEXT NOT NULL,
  center_name TEXT NOT NULL,
  signature_type TEXT NOT NULL CHECK (signature_type IN ('apertura', 'cierre')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  employee_id TEXT,
  employee_name TEXT,
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pending_signatures_signature_id ON pending_signatures(signature_id);
CREATE INDEX IF NOT EXISTS idx_pending_signatures_status ON pending_signatures(status);
CREATE INDEX IF NOT EXISTS idx_pending_signatures_expires_at ON pending_signatures(expires_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE pending_signatures ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer firmas pendientes
CREATE POLICY "Todos pueden leer firmas pendientes"
  ON pending_signatures
  FOR SELECT
  USING (true);

-- Política: Usuarios autenticados pueden crear firmas
CREATE POLICY "Usuarios autenticados pueden crear firmas"
  ON pending_signatures
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Política: Usuarios autenticados pueden actualizar firmas
CREATE POLICY "Usuarios autenticados pueden actualizar firmas"
  ON pending_signatures
  FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Comentarios
COMMENT ON TABLE pending_signatures IS 'Firmas pendientes para sistema QR de checklist';
COMMENT ON COLUMN pending_signatures.signature_id IS 'ID único de la firma (usado en URL del QR)';
COMMENT ON COLUMN pending_signatures.expires_at IS 'Fecha de expiración (10 minutos desde creación)';
