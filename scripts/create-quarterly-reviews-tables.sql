-- Tablas para Revisiones Trimestrales
-- Fecha: 2025-10-23

-- Tabla principal de revisiones
CREATE TABLE IF NOT EXISTS quarterly_reviews (
  id BIGSERIAL PRIMARY KEY,
  quarter TEXT NOT NULL,
  year INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inventory', 'maintenance')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  deadline_date DATE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(quarter, year, type)
);

-- Asignaciones a centros
CREATE TABLE IF NOT EXISTS quarterly_review_assignments (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
  center_id BIGINT REFERENCES centers(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  UNIQUE(review_id, center_id)
);

-- Resultados de inventario
CREATE TABLE IF NOT EXISTS quarterly_inventory_results (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT REFERENCES quarterly_review_assignments(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  system_quantity INTEGER DEFAULT 0,
  counted_quantity INTEGER DEFAULT 0,
  observations TEXT
);

-- Resultados de mantenimiento
CREATE TABLE IF NOT EXISTS quarterly_maintenance_results (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT REFERENCES quarterly_review_assignments(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('good', 'regular', 'bad')),
  observations TEXT
);
