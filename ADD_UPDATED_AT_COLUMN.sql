-- Solución rápida: Añadir columna updated_at que falta
-- Ejecutar en Supabase SQL Editor

-- Añadir la columna updated_at si no existe
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at en cada UPDATE
DROP TRIGGER IF EXISTS update_tareas_updated_at ON tareas;
CREATE TRIGGER update_tareas_updated_at 
    BEFORE UPDATE ON tareas
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que se creó correctamente
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tareas'
AND column_name = 'updated_at';
