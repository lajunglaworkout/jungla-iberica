-- Create enum types for income and expense types if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ingreso_marca_tipo') THEN
    CREATE TYPE ingreso_marca_tipo AS ENUM (
      'royalty',
      'merchandising',
      'arreglos',
      'acuerdo_colaboracion',
      'venta_franquicia',
      'otro'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gasto_marca_tipo') THEN
    CREATE TYPE gasto_marca_tipo AS ENUM (
      'personal',
      'software',
      'gestoria',
      'autonomo',
      'auditoria',
      'mantenimiento_web',
      'financiacion',
      'otro'
    );
  END IF;
END $$;

-- Create brand income table if it doesn't exist
CREATE TABLE IF NOT EXISTS ingresos_marca (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  concepto TEXT NOT NULL,
  tipo ingreso_marca_tipo NOT NULL,
  importe DECIMAL(10, 2) NOT NULL,
  iva BOOLEAN NOT NULL DEFAULT FALSE,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  año INTEGER NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brand expenses table if it doesn't exist
CREATE TABLE IF NOT EXISTS gastos_marca (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  concepto TEXT NOT NULL,
  tipo gasto_marca_tipo NOT NULL,
  importe DECIMAL(10, 2) NOT NULL,
  iva BOOLEAN NOT NULL DEFAULT FALSE,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  año INTEGER NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Primero, eliminar los índices si existen
DO $$
BEGIN
  -- Eliminar índices de ingresos
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ingresos_marca_fecha' AND tablename = 'ingresos_marca') THEN
    EXECUTE 'DROP INDEX IF EXISTS idx_ingresos_marca_fecha';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ingresos_marca_mes_anio' AND tablename = 'ingresos_marca') THEN
    EXECUTE 'DROP INDEX IF EXISTS idx_ingresos_marca_mes_anio';
  END IF;
  
  -- Eliminar índices de gastos
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gastos_marca_fecha' AND tablename = 'gastos_marca') THEN
    EXECUTE 'DROP INDEX IF EXISTS idx_gastos_marca_fecha';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gastos_marca_mes_anio' AND tablename = 'gastos_marca') THEN
    EXECUTE 'DROP INDEX IF EXISTS idx_gastos_marca_mes_anio';
  END IF;
  
  -- Crear nuevos índices
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_ingresos_marca_fecha ON public.ingresos_marca(fecha)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_ingresos_marca_mes_anio ON public.ingresos_marca(mes, año)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_gastos_marca_fecha ON public.gastos_marca(fecha)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_gastos_marca_mes_anio ON public.gastos_marca(mes, año)';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error al manejar los índices: %', SQLERRM;
END $$;

-- Enable Row Level Security
ALTER TABLE ingresos_marca ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_marca ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies
-- Allow authenticated users to view all records
CREATE POLICY "Enable read access for authenticated users" ON ingresos_marca
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON gastos_marca
  FOR SELECT TO authenticated USING (true);

-- Allow insert/update/delete only for admin users
CREATE POLICY "Enable all for admin users" ON ingresos_marca
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Enable all for admin users" ON gastos_marca
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_ingresos_marca_updated_at ON ingresos_marca;
DROP TRIGGER IF EXISTS update_gastos_marca_updated_at ON gastos_marca;

-- Create triggers for updated_at
CREATE TRIGGER update_ingresos_marca_updated_at
BEFORE UPDATE ON ingresos_marca
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_marca_updated_at
BEFORE UPDATE ON gastos_marca
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Drop existing view if it exists
DROP VIEW IF EXISTS resumen_mensual_marca;

-- Create view for monthly summaries
CREATE VIEW resumen_mensual_marca AS
SELECT 
  i.mes,
  i.año,
  COALESCE(SUM(i.importe), 0) as total_ingresos,
  COALESCE(SUM(CASE WHEN i.iva THEN i.importe * 0.21 ELSE 0 END), 0) as iva_ingresos,
  COALESCE(SUM(g.importe), 0) as total_gastos,
  COALESCE(SUM(CASE WHEN g.iva THEN g.importe * 0.21 ELSE 0 END), 0) as iva_gastos,
  COALESCE(SUM(i.importe), 0) - COALESCE(SUM(g.importe), 0) as beneficio_neto
FROM 
  (SELECT mes, año, importe, iva FROM ingresos_marca) i
FULL OUTER JOIN
  (SELECT mes, año, importe, iva FROM gastos_marca) g
USING (mes, año)
GROUP BY i.mes, i.año;

-- Grant permissions
GRANT SELECT ON ingresos_marca TO authenticated;
GRANT SELECT ON gastos_marca TO authenticated;
GRANT SELECT ON resumen_mensual_marca TO authenticated;
