-- Crear tabla para ingresos de la marca
CREATE TABLE IF NOT EXISTS public.ingresos_marca (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concepto TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('royalty', 'merchandising', 'arreglos', 'acuerdo_colaboracion', 'venta_franquicia', 'otro')),
    importe DECIMAL(10, 2) NOT NULL,
    iva BOOLEAN NOT NULL DEFAULT true,
    fecha DATE NOT NULL,
    notas TEXT,
    mes INTEGER NOT NULL,
    año INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Crear tabla para gastos de la marca
CREATE TABLE IF NOT EXISTS public.gastos_marca (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concepto TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('personal', 'software', 'gestoria', 'autonomo', 'auditoria', 'mantenimiento_web', 'financiacion', 'otro')),
    importe DECIMAL(10, 2) NOT NULL,
    iva BOOLEAN NOT NULL DEFAULT true,
    fecha DATE NOT NULL,
    notas TEXT,
    mes INTEGER NOT NULL,
    año INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_ingresos_marca_fecha ON public.ingresos_marca(año, mes);
CREATE INDEX IF NOT EXISTS idx_ingresos_marca_tipo ON public.ingresos_marca(tipo);
CREATE INDEX IF NOT EXISTS idx_gastos_marca_fecha ON public.gastos_marca(año, mes);
CREATE INDEX IF NOT EXISTS idx_gastos_marca_tipo ON public.gastos_marca(tipo);

-- Habilitar RLS (Row Level Security) para mayor seguridad
ALTER TABLE public.ingresos_marca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos_marca ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para ingresos_marca
CREATE POLICY "Los usuarios pueden ver sus propios ingresos" 
ON public.ingresos_marca 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios ingresos" 
ON public.ingresos_marca 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios ingresos" 
ON public.ingresos_marca 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios ingresos" 
ON public.ingresos_marca 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas de seguridad para gastos_marca
CREATE POLICY "Los usuarios pueden ver sus propios gastos" 
ON public.gastos_marca 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios gastos" 
ON public.gastos_marca 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios gastos" 
ON public.gastos_marca 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios gastos" 
ON public.gastos_marca 
FOR DELETE 
USING (auth.uid() = user_id);

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar automáticamente updated_at
CREATE TRIGGER update_ingresos_marca_updated_at
BEFORE UPDATE ON public.ingresos_marca
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_marca_updated_at
BEFORE UPDATE ON public.gastos_marca
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentar las tablas y columnas
COMMENT ON TABLE public.ingresos_marca IS 'Registro de ingresos de la marca La Jungla';
COMMENT ON COLUMN public.ingresos_marca.tipo IS 'Tipo de ingreso: royalty, merchandising, arreglos, acuerdo_colaboracion, venta_franquicia, otro';
COMMENT ON COLUMN public.ingresos_marca.iva IS 'Indica si el importe incluye IVA';

COMMENT ON TABLE public.gastos_marca IS 'Registro de gastos de la marca La Jungla';
COMMENT ON COLUMN public.gastos_marca.tipo IS 'Tipo de gasto: personal, software, gestoria, autonomo, auditoria, mantenimiento_web, financiacion, otro';
COMMENT ON COLUMN public.gastos_marca.iva IS 'Indica si el importe incluye IVA';
