-- SISTEMA DE CONTABILIDAD PARA LA JUNGLA CRM
-- Tablas para gestión financiera por centro

-- Tabla de datos financieros mensuales por centro
CREATE TABLE IF NOT EXISTS financial_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id TEXT NOT NULL,
  center_name TEXT NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  año INTEGER NOT NULL CHECK (año >= 2020),
  
  -- Servicios adicionales
  nutricion DECIMAL(10,2) DEFAULT 0,
  fisioterapia DECIMAL(10,2) DEFAULT 0,
  entrenamiento_personal DECIMAL(10,2) DEFAULT 0,
  entrenamientos_grupales DECIMAL(10,2) DEFAULT 0,
  otros DECIMAL(10,2) DEFAULT 0,
  
  -- Gastos básicos
  alquiler DECIMAL(10,2) DEFAULT 0,
  suministros DECIMAL(10,2) DEFAULT 0,
  nominas DECIMAL(10,2) DEFAULT 0,
  seguridad_social DECIMAL(10,2) DEFAULT 0,
  marketing DECIMAL(10,2) DEFAULT 0,
  mantenimiento DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint único por centro y mes/año
  UNIQUE(center_id, mes, año)
);

-- Tabla de tipos de cuotas por centro
CREATE TABLE IF NOT EXISTS cuota_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint único por centro y nombre
  UNIQUE(center_id, nombre)
);

-- Tabla de cuotas mensuales (cantidad de clientes por tipo)
CREATE TABLE IF NOT EXISTS monthly_cuotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_data_id UUID REFERENCES financial_data(id) ON DELETE CASCADE,
  cuota_type_id UUID REFERENCES cuota_types(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  importe DECIMAL(10,2) NOT NULL CHECK (importe >= 0), -- precio sin IVA
  iva DECIMAL(10,2) NOT NULL CHECK (iva >= 0), -- IVA calculado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de gastos extras
CREATE TABLE IF NOT EXISTS gastos_extras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_data_id UUID REFERENCES financial_data(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  importe DECIMAL(10,2) NOT NULL CHECK (importe > 0),
  categoria TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar tipos de cuotas por defecto para cada centro
INSERT INTO cuota_types (center_id, nombre, precio) VALUES
-- Sevilla
('sevilla', 'Fundador', 45.00),
('sevilla', 'Nuevo', 55.00),
('sevilla', 'Acuerdo', 35.00),
-- Jerez  
('jerez', 'Fundador', 45.00),
('jerez', 'Nuevo', 55.00),
('jerez', 'Acuerdo', 35.00),
-- Puerto
('puerto', 'Fundador', 45.00),
('puerto', 'Nuevo', 55.00),
('puerto', 'Acuerdo', 35.00)
ON CONFLICT (center_id, nombre) DO NOTHING;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_financial_data_center_date ON financial_data(center_id, año, mes);
CREATE INDEX IF NOT EXISTS idx_cuota_types_center ON cuota_types(center_id, activo);
CREATE INDEX IF NOT EXISTS idx_monthly_cuotas_financial_data ON monthly_cuotas(financial_data_id);
CREATE INDEX IF NOT EXISTS idx_gastos_extras_financial_data ON gastos_extras(financial_data_id);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_financial_data_updated_at 
    BEFORE UPDATE ON financial_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuota_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_cuotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_extras ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver y modificar datos de todos los centros
CREATE POLICY "Users can manage all financial data" ON financial_data
    FOR ALL USING (true);

CREATE POLICY "Users can manage all cuota types" ON cuota_types
    FOR ALL USING (true);

CREATE POLICY "Users can manage all monthly cuotas" ON monthly_cuotas
    FOR ALL USING (true);

CREATE POLICY "Users can manage all gastos extras" ON gastos_extras
    FOR ALL USING (true);
