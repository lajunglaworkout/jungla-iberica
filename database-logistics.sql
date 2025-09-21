-- =====================================================
-- SISTEMA DE LOGÍSTICA - LA JUNGLA CRM
-- Base de datos para gestión de inventario y pedidos
-- =====================================================

-- Tabla de categorías de productos
CREATE TABLE IF NOT EXISTS product_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    tax_id VARCHAR(50),
    payment_terms INTEGER DEFAULT 30, -- días
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos/inventario
CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES product_categories(id),
    supplier_id BIGINT REFERENCES suppliers(id),
    sku VARCHAR(100) UNIQUE,
    size VARCHAR(20),
    color VARCHAR(50),
    quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 100,
    cost_per_unit DECIMAL(10,2) DEFAULT 0.00,
    selling_price DECIMAL(10,2) DEFAULT 0.00,
    location VARCHAR(100), -- ubicación en almacén
    barcode VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'out_of_stock')),
    last_restock_date DATE,
    expiry_date DATE, -- para productos perecederos
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pedidos a proveedores
CREATE TABLE IF NOT EXISTS supplier_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    created_by BIGINT, -- referencia a empleado
    approved_by BIGINT, -- referencia a empleado
    received_by BIGINT, -- referencia a empleado
    notes TEXT,
    tracking_number VARCHAR(100),
    invoice_number VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de pedidos
CREATE TABLE IF NOT EXISTS supplier_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES supplier_orders(id) ON DELETE CASCADE,
    inventory_item_id BIGINT REFERENCES inventory_items(id),
    item_name VARCHAR(200) NOT NULL, -- por si el item no existe aún en inventario
    item_description TEXT,
    size VARCHAR(20),
    color VARCHAR(50),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    received_quantity INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de movimientos de inventario (entradas/salidas)
CREATE TABLE IF NOT EXISTS inventory_movements (
    id BIGSERIAL PRIMARY KEY,
    inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer')),
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    reference_type VARCHAR(50), -- 'supplier_order', 'uniform_request', 'adjustment', etc.
    reference_id BIGINT, -- ID del pedido, solicitud, etc.
    reason TEXT,
    performed_by BIGINT, -- referencia a empleado
    location_from VARCHAR(100),
    location_to VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de solicitudes de vestuario (extendida)
CREATE TABLE IF NOT EXISTS uniform_requests (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    employee_name VARCHAR(200) NOT NULL,
    employee_email VARCHAR(100) NOT NULL,
    center_id BIGINT,
    center_name VARCHAR(100),
    inventory_item_id BIGINT REFERENCES inventory_items(id),
    clothing_type VARCHAR(100) NOT NULL,
    clothing_size VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled', 'cancelled')),
    description TEXT,
    justification TEXT,
    requested_date DATE DEFAULT CURRENT_DATE,
    approved_by BIGINT,
    approved_at TIMESTAMP WITH TIME ZONE,
    fulfilled_by BIGINT,
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    delivery_address TEXT,
    delivery_date DATE,
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de alertas de stock
CREATE TABLE IF NOT EXISTS stock_alerts (
    id BIGSERIAL PRIMARY KEY,
    inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id),
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expired', 'expiring_soon')),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by BIGINT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_quantity ON inventory_items(quantity);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_status ON supplier_orders(status);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_date ON supplier_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_uniform_requests_status ON uniform_requests(status);
CREATE INDEX IF NOT EXISTS idx_uniform_requests_employee ON uniform_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item ON inventory_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_resolved ON stock_alerts(is_resolved);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar stock automáticamente
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar cantidad en inventory_items
    UPDATE inventory_items 
    SET quantity = NEW.new_quantity,
        updated_at = NOW()
    WHERE id = NEW.inventory_item_id;
    
    -- Verificar alertas de stock
    INSERT INTO stock_alerts (inventory_item_id, alert_type, message)
    SELECT 
        ii.id,
        CASE 
            WHEN NEW.new_quantity = 0 THEN 'out_of_stock'
            WHEN NEW.new_quantity <= ii.min_stock THEN 'low_stock'
        END,
        CASE 
            WHEN NEW.new_quantity = 0 THEN 'Producto sin stock: ' || ii.name
            WHEN NEW.new_quantity <= ii.min_stock THEN 'Stock bajo para: ' || ii.name || ' (Cantidad: ' || NEW.new_quantity || ', Mínimo: ' || ii.min_stock || ')'
        END
    FROM inventory_items ii
    WHERE ii.id = NEW.inventory_item_id
    AND (NEW.new_quantity = 0 OR NEW.new_quantity <= ii.min_stock)
    AND NOT EXISTS (
        SELECT 1 FROM stock_alerts sa 
        WHERE sa.inventory_item_id = ii.id 
        AND sa.alert_type IN ('out_of_stock', 'low_stock')
        AND sa.is_resolved = false
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar stock
CREATE TRIGGER trigger_update_inventory_stock
    AFTER INSERT ON inventory_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_stock();

-- Función para calcular total de pedido
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE supplier_orders 
    SET total_amount = (
        SELECT COALESCE(SUM(total_cost), 0)
        FROM supplier_order_items 
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para recalcular total de pedido
CREATE TRIGGER trigger_calculate_order_total
    AFTER INSERT OR UPDATE OR DELETE ON supplier_order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_total();

-- Función para generar número de pedido automático
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                           LPAD(NEXTVAL('supplier_orders_id_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número de pedido
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON supplier_orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Categorías de productos
INSERT INTO product_categories (name, description) VALUES
('Camisetas', 'Camisetas deportivas y casuales'),
('Pantalones', 'Pantalones cortos y largos'),
('Chaquetas', 'Chaquetas y chaquetones'),
('Calzado', 'Zapatillas y calzado deportivo'),
('Accesorios', 'Gorras, calcetines y otros accesorios'),
('Material Deportivo', 'Equipamiento para entrenamientos')
ON CONFLICT (name) DO NOTHING;

-- Proveedores
INSERT INTO suppliers (name, contact_person, email, phone, address, city, postal_code) VALUES
('Textiles Deportivos SL', 'María García', 'pedidos@textiles-deportivos.com', '954123456', 'Calle Industria 15', 'Sevilla', '41010'),
('Deportes Andalucía', 'Juan Martínez', 'ventas@deportes-andalucia.es', '956789012', 'Av. Constitución 45', 'Jerez de la Frontera', '11402'),
('Ropa Técnica Pro', 'Ana López', 'info@ropatecnicapro.com', '956345678', 'Polígono Industrial 8', 'El Puerto de Santa María', '11500'),
('Calzado Sport Plus', 'Carlos Ruiz', 'pedidos@calzadosport.es', '954567890', 'Calle Comercio 23', 'Sevilla', '41003')
ON CONFLICT (name) DO NOTHING;

-- Items de inventario iniciales
INSERT INTO inventory_items (name, description, category_id, supplier_id, sku, size, color, quantity, min_stock, max_stock, cost_per_unit, selling_price, location) VALUES
('Camiseta La Jungla - Negra', 'Camiseta técnica con logo La Jungla', 1, 1, 'CAM-LJ-NEG-M', 'M', 'Negro', 25, 10, 50, 15.50, 25.00, 'Almacén Principal - A1'),
('Camiseta La Jungla - Negra', 'Camiseta técnica con logo La Jungla', 1, 1, 'CAM-LJ-NEG-L', 'L', 'Negro', 20, 10, 50, 15.50, 25.00, 'Almacén Principal - A1'),
('Camiseta La Jungla - Negra', 'Camiseta técnica con logo La Jungla', 1, 1, 'CAM-LJ-NEG-XL', 'XL', 'Negro', 15, 10, 50, 15.50, 25.00, 'Almacén Principal - A1'),
('Pantalón Corto La Jungla', 'Pantalón corto deportivo', 2, 2, 'PAN-LJ-COR-L', 'L', 'Negro', 5, 10, 30, 22.00, 35.00, 'Almacén Principal - B2'),
('Pantalón Corto La Jungla', 'Pantalón corto deportivo', 2, 2, 'PAN-LJ-COR-XL', 'XL', 'Negro', 8, 10, 30, 22.00, 35.00, 'Almacén Principal - B2'),
('Chaquetón Invierno', 'Chaquetón técnico para invierno', 3, 3, 'CHA-LJ-INV-XL', 'XL', 'Negro', 0, 5, 20, 45.00, 75.00, 'Almacén Principal - C1'),
('Gorra La Jungla', 'Gorra con logo bordado', 5, 1, 'GOR-LJ-001', 'Única', 'Negro', 30, 15, 60, 8.50, 15.00, 'Almacén Principal - D1'),
('Calcetines Deportivos', 'Pack 3 pares calcetines', 5, 2, 'CAL-DEP-3P', 'M', 'Blanco', 50, 20, 100, 6.00, 12.00, 'Almacén Principal - D2')
ON CONFLICT (sku) DO NOTHING;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de inventario con información completa
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
    ii.id,
    ii.name,
    ii.sku,
    ii.size,
    ii.color,
    ii.quantity,
    ii.min_stock,
    ii.max_stock,
    ii.cost_per_unit,
    ii.selling_price,
    (ii.quantity * ii.cost_per_unit) as total_value,
    ii.location,
    pc.name as category_name,
    s.name as supplier_name,
    s.email as supplier_email,
    CASE 
        WHEN ii.quantity = 0 THEN 'out_of_stock'
        WHEN ii.quantity <= ii.min_stock THEN 'low_stock'
        ELSE 'in_stock'
    END as stock_status,
    ii.created_at,
    ii.updated_at
FROM inventory_items ii
LEFT JOIN product_categories pc ON ii.category_id = pc.id
LEFT JOIN suppliers s ON ii.supplier_id = s.id
WHERE ii.status = 'active';

-- Vista de pedidos con detalles
CREATE OR REPLACE VIEW orders_summary AS
SELECT 
    so.id,
    so.order_number,
    so.status,
    so.order_date,
    so.expected_delivery,
    so.actual_delivery,
    so.total_amount,
    s.name as supplier_name,
    s.email as supplier_email,
    s.phone as supplier_phone,
    COUNT(soi.id) as total_items,
    SUM(soi.quantity) as total_quantity,
    so.notes,
    so.created_at
FROM supplier_orders so
LEFT JOIN suppliers s ON so.supplier_id = s.id
LEFT JOIN supplier_order_items soi ON so.id = soi.order_id
GROUP BY so.id, s.name, s.email, s.phone;

-- Vista de alertas activas
CREATE OR REPLACE VIEW active_alerts AS
SELECT 
    sa.id,
    sa.alert_type,
    sa.message,
    ii.name as item_name,
    ii.sku,
    ii.quantity,
    ii.min_stock,
    sa.created_at
FROM stock_alerts sa
JOIN inventory_items ii ON sa.inventory_item_id = ii.id
WHERE sa.is_resolved = false
ORDER BY sa.created_at DESC;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- Este script crea un sistema completo de logística que incluye:
-- 1. Gestión de inventario con categorías y proveedores
-- 2. Sistema de pedidos a proveedores con items detallados
-- 3. Seguimiento de movimientos de inventario
-- 4. Solicitudes de vestuario integradas
-- 5. Sistema de alertas automáticas de stock
-- 6. Triggers para automatizar cálculos y actualizaciones
-- 7. Vistas optimizadas para consultas frecuentes

-- Para usar este sistema:
-- 1. Ejecutar este script en Supabase
-- 2. Configurar las políticas RLS según los roles de usuario
-- 3. Actualizar el componente React para usar las nuevas tablas
-- 4. Implementar las funciones de CRUD en el frontend
