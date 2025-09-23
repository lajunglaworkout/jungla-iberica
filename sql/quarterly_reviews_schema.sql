-- Schema para Sistema de Revisiones Trimestrales
-- La Jungla Workout - Sistema de Inventario

-- Tabla principal de revisiones trimestrales
CREATE TABLE IF NOT EXISTS quarterly_reviews (
    id SERIAL PRIMARY KEY,
    center_id INTEGER NOT NULL,
    center_name VARCHAR(100) NOT NULL,
    quarter VARCHAR(10) NOT NULL, -- 'Q1-2025', 'Q2-2025', etc.
    year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'in_review', 'completed', 'approved'
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_date TIMESTAMP NULL,
    approved_date TIMESTAMP NULL,
    created_by VARCHAR(255) NOT NULL, -- Email del creador (Beni)
    reviewed_by VARCHAR(255) NULL, -- Email del encargado que revisa
    approved_by VARCHAR(255) NULL, -- Email de quien aprueba (Beni)
    total_items INTEGER DEFAULT 0,
    total_discrepancies INTEGER DEFAULT 0,
    notes TEXT,
    UNIQUE(center_id, quarter, year)
);

-- Tabla de items individuales de cada revisión
CREATE TABLE IF NOT EXISTS quarterly_review_items (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
    inventory_item_id INTEGER NOT NULL, -- Referencia al item del inventario
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    current_system_quantity INTEGER NOT NULL, -- Lo que dice el sistema
    counted_quantity INTEGER DEFAULT 0, -- Lo que cuenta el encargado
    regular_state_quantity INTEGER DEFAULT 0, -- En buen estado
    deteriorated_quantity INTEGER DEFAULT 0, -- Deteriorados
    to_remove_quantity INTEGER DEFAULT 0, -- Para retirar
    observations TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'counted', 'reviewed', 'approved'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones para encargados
CREATE TABLE IF NOT EXISTS review_notifications (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'assigned', 'reminder', 'approved', 'rejected'
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_quarterly_reviews_center ON quarterly_reviews(center_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_reviews_quarter ON quarterly_reviews(quarter, year);
CREATE INDEX IF NOT EXISTS idx_quarterly_reviews_status ON quarterly_reviews(status);
CREATE INDEX IF NOT EXISTS idx_quarterly_review_items_review ON quarterly_review_items(review_id);
CREATE INDEX IF NOT EXISTS idx_review_notifications_user ON review_notifications(user_email);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en quarterly_review_items
CREATE TRIGGER update_quarterly_review_items_updated_at 
    BEFORE UPDATE ON quarterly_review_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE quarterly_reviews IS 'Revisiones trimestrales de inventario por centro';
COMMENT ON TABLE quarterly_review_items IS 'Items individuales de cada revisión trimestral';
COMMENT ON TABLE review_notifications IS 'Notificaciones para encargados sobre revisiones';

COMMENT ON COLUMN quarterly_reviews.status IS 'Estados: draft, in_review, completed, approved';
COMMENT ON COLUMN quarterly_review_items.status IS 'Estados: pending, counted, reviewed, approved';
COMMENT ON COLUMN review_notifications.notification_type IS 'Tipos: assigned, reminder, approved, rejected';

-- Datos de ejemplo para testing (comentados para producción)
/*
-- Ejemplo de revisión Q4-2025 para Sevilla
INSERT INTO quarterly_reviews (center_id, center_name, quarter, year, created_by, total_items) 
VALUES (9, 'Sevilla', 'Q4-2025', 2025, 'beni@lajungla.com', 0);

-- Ejemplo de items de revisión
INSERT INTO quarterly_review_items (review_id, inventory_item_id, product_name, category, current_system_quantity)
VALUES 
(1, 1, 'Mancuerna 4KG', 'Material Deportivo', 8),
(1, 2, 'Mancuerna 5KG', 'Material Deportivo', 6);
*/
