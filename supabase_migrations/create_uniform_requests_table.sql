-- Tabla para solicitudes de uniformes
CREATE TABLE IF NOT EXISTS uniform_requests (
  id BIGSERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  location TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('reposicion', 'compra')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'delivered')),
  items JSONB NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  delivered_at TIMESTAMPTZ,
  delivered_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_uniform_requests_status ON uniform_requests(status);
CREATE INDEX IF NOT EXISTS idx_uniform_requests_location ON uniform_requests(location);
CREATE INDEX IF NOT EXISTS idx_uniform_requests_requested_at ON uniform_requests(requested_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_uniform_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_uniform_requests_updated_at
  BEFORE UPDATE ON uniform_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_uniform_requests_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE uniform_requests IS 'Solicitudes de uniformes y vestuario de empleados';
COMMENT ON COLUMN uniform_requests.items IS 'Array JSON con los artículos solicitados: [{"itemId": "123", "itemName": "Camiseta", "quantity": 2}]';
COMMENT ON COLUMN uniform_requests.reason IS 'Motivo de la solicitud: reposicion (dotación por deterioro) o compra (compra puntual)';
COMMENT ON COLUMN uniform_requests.status IS 'Estado: pending (pendiente), approved (aprobada), rejected (rechazada), delivered (entregada)';
