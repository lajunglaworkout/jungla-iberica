-- =====================================================
-- TABLA DE HERRAMIENTAS - LA JUNGLA CRM
-- Compatible con el componente LogisticsManagementSystem
-- =====================================================

-- Crear tabla de herramientas
CREATE TABLE IF NOT EXISTS tools (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_price DECIMAL(10,2) DEFAULT 0.00,
    current_location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'lost', 'damaged')),
    condition VARCHAR(20) DEFAULT 'excellent' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    assigned_to VARCHAR(100),
    last_maintenance DATE,
    next_maintenance DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_location ON tools(current_location);
CREATE INDEX IF NOT EXISTS idx_tools_assigned ON tools(assigned_to);

-- Trigger para actualizar timestamps
CREATE TRIGGER update_tools_updated_at 
    BEFORE UPDATE ON tools 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo de herramientas (los mismos del componente)
INSERT INTO tools (name, category, brand, model, serial_number, purchase_date, purchase_price, current_location, status, condition, assigned_to, last_maintenance, next_maintenance, notes) 
SELECT 
    name, category, brand, model, serial_number, 
    purchase_date::DATE, purchase_price, current_location, status, condition, 
    assigned_to, last_maintenance::DATE, next_maintenance::DATE, notes
FROM (VALUES
    ('Aspiradora Industrial Kärcher', 'Limpieza', 'Kärcher', 'NT 70/2', 'KAR2023001', '2023-01-15', 450.00, 'central', 'available', 'excellent', NULL, '2024-01-15', '2024-07-15', 'Aspiradora de alta potencia para limpieza profunda'),
    ('Taladro Percutor Bosch', 'Mantenimiento', 'Bosch', 'GSB 13 RE', 'BSH2023002', '2023-03-10', 89.99, 'sevilla', 'in_use', 'good', 'Ana García', '2024-02-01', '2024-08-01', 'En uso para mantenimiento general del centro'),
    ('Extintor CO2 5kg', 'Seguridad', 'Cofem', 'CO2-5', 'COF2023003', '2023-02-20', 65.00, 'jerez', 'available', 'excellent', NULL, '2024-02-20', '2025-02-20', 'Extintor para equipos eléctricos'),
    ('Cinta de Correr Reparación', 'Deportivo', 'TechnoGym', 'Run Race 1400', 'TG2022004', '2022-11-05', 2500.00, 'taller', 'maintenance', 'fair', 'José Ruiz', '2024-01-10', NULL, 'En reparación - problema con motor'),
    ('Ordenador Portátil HP', 'Oficina', 'HP', 'EliteBook 840', 'HP2023005', '2023-06-15', 899.00, 'puerto', 'in_use', 'excellent', 'María López', NULL, NULL, 'Portátil para gestión del centro'),
    ('Mopa Industrial', 'Limpieza', 'Vileda', 'UltraSpeed Pro', NULL, '2023-04-01', 25.50, 'storage', 'lost', 'good', NULL, NULL, NULL, 'Perdida desde hace 2 semanas - última vez vista en Centro Sevilla')
) AS new_tools(name, category, brand, model, serial_number, purchase_date, purchase_price, current_location, status, condition, assigned_to, last_maintenance, next_maintenance, notes)
WHERE NOT EXISTS (SELECT 1 FROM tools WHERE tools.name = new_tools.name AND tools.serial_number = new_tools.serial_number);

-- Comentarios
COMMENT ON TABLE tools IS 'Herramientas y equipamiento de La Jungla';
COMMENT ON COLUMN tools.status IS 'Estado de la herramienta: available, in_use, maintenance, lost, damaged';
COMMENT ON COLUMN tools.condition IS 'Condición física: excellent, good, fair, poor';
COMMENT ON COLUMN tools.current_location IS 'Ubicación actual de la herramienta';

-- Verificación
-- SELECT count(*) as total_tools FROM tools;
-- SELECT status, count(*) FROM tools GROUP BY status;
