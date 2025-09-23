-- Crear tabla de inventario real con las columnas que usa Beni
-- Ejecutar en Supabase SQL Editor

-- Primero, eliminar la tabla anterior si existe
DROP TABLE IF EXISTS inventory_items CASCADE;

-- Crear nueva tabla con estructura real de Beni
CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,
    center_id BIGINT REFERENCES centers(id),
    codigo VARCHAR(20) NOT NULL UNIQUE, -- Código único del item (MD001, MD002, etc.)
    nombre_item VARCHAR(255) NOT NULL, -- Nombre descriptivo del item
    categoria VARCHAR(100), -- Categoría del equipamiento
    
    -- Columnas de control de inventario (como las usa Beni)
    cantidad_inicial INTEGER DEFAULT 0, -- Cantidad inicial al abrir el gimnasio
    cantidad_actual INTEGER DEFAULT 0, -- Cantidad actual disponible
    roturas INTEGER DEFAULT 0, -- Cantidad de items rotos
    deterioradas INTEGER DEFAULT 0, -- Cantidad de items deteriorados
    compradas INTEGER DEFAULT 0, -- Cantidad de items comprados posteriormente
    
    -- Campos adicionales para el sistema
    precio_compra DECIMAL(10,2), -- Precio de compra unitario
    precio_venta DECIMAL(10,2), -- Precio de venta/reposición
    proveedor VARCHAR(255), -- Proveedor del item
    fecha_ultima_compra DATE, -- Fecha de última compra
    ubicacion VARCHAR(100), -- Ubicación en el gimnasio
    
    -- Estado y control
    estado VARCHAR(50) DEFAULT 'activo', -- activo, descontinuado, agotado
    notas TEXT, -- Notas adicionales
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_inventory_center ON inventory_items(center_id);
CREATE INDEX idx_inventory_codigo ON inventory_items(codigo);
CREATE INDEX idx_inventory_categoria ON inventory_items(categoria);
CREATE INDEX idx_inventory_estado ON inventory_items(estado);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para updated_at
CREATE TRIGGER trigger_inventory_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_updated_at();

-- Verificar que la tabla se creó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
ORDER BY ordinal_position;
