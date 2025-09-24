-- =====================================================
-- COMPLETAR TABLAS PARA LOGÍSTICA - LA JUNGLA CRM
-- Basado en el esquema existente de Supabase
-- =====================================================

-- 1. CREAR TABLA DE PEDIDOS INTERNOS (centro ↔ marca)
-- Esta tabla es diferente de supplier_orders (que es marca → proveedor)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('center_to_brand', 'brand_to_supplier')),
    from_location VARCHAR(100) NOT NULL,
    to_location VARCHAR(100) NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    estimated_delivery DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'delivered', 'cancelled')),
    amount DECIMAL(10,2) DEFAULT 0.00,
    created_by VARCHAR(100),
    processed_date DATE,
    sent_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREAR TABLA DE ITEMS DE PEDIDOS INTERNOS
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER,
    product_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    available_stock INTEGER DEFAULT 0,
    has_sufficient_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ACTUALIZAR TABLA SUPPLIERS para añadir campos del componente
-- Primero verificamos qué campos faltan y los añadimos
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS country VARCHAR(50) DEFAULT 'España',
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'local' CHECK (type IN ('local', 'nacional', 'internacional')),
ADD COLUMN IF NOT EXISTS category TEXT[], -- Array de categorías
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_order_date DATE,
ADD COLUMN IF NOT EXISTS delivery_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS website VARCHAR(200);

-- 4. ACTUALIZAR TABLA INVENTORY_ITEMS para compatibilidad
-- Añadir campos que usa nuestro componente si no existen
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS size VARCHAR(20),
ADD COLUMN IF NOT EXISTS supplier VARCHAR(200),
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. CREAR ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(type);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(type);
CREATE INDEX IF NOT EXISTS idx_suppliers_rating ON suppliers(rating);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_center ON inventory_items(center_id);

-- 6. FUNCIÓN PARA ACTUALIZAR TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGERS PARA ACTUALIZAR TIMESTAMPS
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at 
    BEFORE UPDATE ON inventory_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. INSERTAR DATOS DE EJEMPLO PARA PEDIDOS INTERNOS
-- Primero verificamos si ya existen para evitar duplicados
INSERT INTO orders (id, type, from_location, to_location, order_date, delivery_date, estimated_delivery, status, amount, created_by, processed_date, sent_date) 
SELECT 
    id, type, from_location, to_location, 
    order_date::DATE, delivery_date::DATE, estimated_delivery::DATE, 
    status, amount, created_by, 
    processed_date::DATE, sent_date::DATE
FROM (VALUES
    ('PED-2025-001', 'brand_to_supplier', 'La Jungla Central', 'Textiles Deportivos SL', '2025-01-10', '2025-01-15', '2025-01-15', 'delivered', 465.00, 'Beni Morales', '2025-01-10', '2025-01-11'),
    ('PED-2025-002', 'brand_to_supplier', 'La Jungla Central', 'FitEquip España', '2025-01-12', '2025-01-25', '2025-01-25', 'delivered', 875.00, 'María López', '2025-01-11', '2025-01-12'),
    ('REQ-2025-001', 'center_to_brand', 'Centro Sevilla', 'La Jungla Central', '2025-01-19', '2025-01-23', '2025-01-23', 'sent', 175.00, 'Pedro Martín', '2025-01-20', '2025-01-20')
) AS new_orders(id, type, from_location, to_location, order_date, delivery_date, estimated_delivery, status, amount, created_by, processed_date, sent_date)
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.id = new_orders.id);

-- 9. INSERTAR ITEMS DE PEDIDOS DE EJEMPLO
-- Solo insertar si los pedidos existen
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price, available_stock, has_sufficient_stock) 
SELECT * FROM (VALUES
    ('PED-2025-001', 1, 'Camisetas La Jungla', 15, 31.00, 465.00, 25, true),
    ('PED-2025-002', 3, 'Mancuernas 5kg', 25, 35.00, 875.00, 3, false),
    ('REQ-2025-001', 3, 'Mancuernas 5kg', 5, 35.00, 175.00, 3, false)
) AS new_items(order_id, product_id, product_name, quantity, unit_price, total_price, available_stock, has_sufficient_stock)
WHERE EXISTS (SELECT 1 FROM orders WHERE orders.id = new_items.order_id);

-- 10. ACTUALIZAR DATOS DE PROVEEDORES EXISTENTES
UPDATE suppliers SET 
    country = 'España',
    type = 'local',
    category = ARRAY['Vestuario', 'Merchandising'],
    rating = 4.8,
    total_orders = 156,
    total_amount = 89450.50,
    last_order_date = '2025-01-15'::DATE,
    delivery_time = '3-5 días',
    website = 'www.textiles-deportivos.com'
WHERE name = 'Textiles Deportivos SL';

-- 11. INSERTAR PROVEEDORES ADICIONALES SI NO EXISTEN
INSERT INTO suppliers (name, contact_person, email, phone, address, city, postal_code, country, type, category, rating, total_orders, total_amount, last_order_date, delivery_time, website, tax_id, notes) 
SELECT 
    name, contact_person, email, phone, address, city, postal_code, country, type, category, 
    rating, total_orders, total_amount, last_order_date::DATE, delivery_time, website, tax_id, notes
FROM (VALUES
    ('Equipos Fitness Pro SA', 'Juan Carlos Pérez', 'comercial@fitness-pro.es', '+34 915 987 654', 'Polígono Industrial Las Rozas, Nave 12', 'Madrid', '28232', 'España', 'nacional', ARRAY['Material Deportivo', 'Maquinaria'], 4.6, 89, 125600.75, '2025-01-18', '5-7 días', 'www.fitness-pro.es', 'A12345678', 'Proveedor principal de equipamiento fitness'),
    ('Deportes Cádiz SL', 'Ana Martínez López', 'pedidos@deportescadiz.com', '+34 956 234 567', 'Calle Comercio, 23', 'Cádiz', '11001', 'España', 'local', ARRAY['Vestuario', 'Calzado'], 4.2, 67, 45200.30, '2025-01-12', '2-4 días', 'www.deportescadiz.com', 'B87654321', 'Proveedor local de Andalucía'),
    ('Global Sports International', 'Michael Johnson', 'sales@globalsports.com', '+49 30 123 4567', 'Hauptstraße 45', 'Berlin', '10115', 'Alemania', 'internacional', ARRAY['Material Deportivo', 'Tecnología'], 4.9, 234, 567890.25, '2025-01-20', '10-15 días', 'www.globalsports.com', 'DE123456789', 'Proveedor internacional premium'),
    ('Suministros Jerez', 'Francisco García', 'info@suministrosjerez.es', '+34 956 345 678', 'Av. de la Constitución, 67', 'Jerez de la Frontera', '11402', 'España', 'local', ARRAY['Limpieza', 'Consumibles'], 4.0, 45, 12800.50, '2025-01-08', '1-2 días', NULL, 'C11223344', 'Proveedor local de consumibles')
) AS new_suppliers(name, contact_person, email, phone, address, city, postal_code, country, type, category, rating, total_orders, total_amount, last_order_date, delivery_time, website, tax_id, notes)
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE suppliers.name = new_suppliers.name);

-- 12. COMENTARIOS FINALES
COMMENT ON TABLE orders IS 'Pedidos internos entre centros y marca (diferente de supplier_orders)';
COMMENT ON TABLE order_items IS 'Items de pedidos internos';
COMMENT ON COLUMN suppliers.category IS 'Array de categorías que sirve el proveedor';
COMMENT ON COLUMN suppliers.type IS 'Tipo de proveedor: local, nacional, internacional';
COMMENT ON COLUMN suppliers.rating IS 'Valoración del proveedor (0-5 estrellas)';

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
-- Ejecutar estas consultas para verificar que todo está correcto:

-- SELECT 'orders' as tabla, count(*) as registros FROM orders
-- UNION ALL
-- SELECT 'order_items' as tabla, count(*) as registros FROM order_items
-- UNION ALL  
-- SELECT 'suppliers' as tabla, count(*) as registros FROM suppliers
-- UNION ALL
-- SELECT 'inventory_items' as tabla, count(*) as registros FROM inventory_items;

-- SELECT name, type, category, rating, total_orders FROM suppliers LIMIT 5;
