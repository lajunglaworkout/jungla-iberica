-- Corregir esquema de revisiones trimestrales
-- Fecha: 2025-10-23
-- IMPORTANTE: Inventario y Mantenimiento son INDEPENDIENTES

-- ============================================
-- REVISIONES DE INVENTARIO (Beni - Logística)
-- ============================================

-- Añadir columnas a quarterly_reviews (ya existente para inventario)
ALTER TABLE quarterly_reviews 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'inventory',
ADD COLUMN IF NOT EXISTS deadline_date DATE,
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

-- Crear tabla de asignaciones de inventario
CREATE TABLE IF NOT EXISTS quarterly_inventory_assignments (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
  center_id INTEGER REFERENCES centers(id),
  center_name VARCHAR(255),
  assigned_to VARCHAR(255), -- Email del encargado
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by VARCHAR(255),
  UNIQUE(review_id, center_id)
);

-- Añadir assignment_id a quarterly_review_items
ALTER TABLE quarterly_review_items 
ADD COLUMN IF NOT EXISTS assignment_id INTEGER REFERENCES quarterly_inventory_assignments(id);

-- ============================================
-- REVISIONES DE MANTENIMIENTO (Director Mantenimiento)
-- ============================================

-- Crear tabla principal de revisiones de mantenimiento
CREATE TABLE IF NOT EXISTS quarterly_maintenance_reviews (
  id SERIAL PRIMARY KEY,
  quarter VARCHAR(50) NOT NULL, -- 'Q1-2025', 'Q2-2025'
  year INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  deadline_date DATE,
  created_by VARCHAR(255) NOT NULL, -- Email del director de mantenimiento
  created_date TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  total_centers INTEGER DEFAULT 0,
  completed_centers INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(quarter, year)
);

-- Crear tabla de asignaciones de mantenimiento
CREATE TABLE IF NOT EXISTS quarterly_maintenance_assignments (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES quarterly_maintenance_reviews(id) ON DELETE CASCADE,
  center_id INTEGER REFERENCES centers(id),
  center_name VARCHAR(255),
  assigned_to VARCHAR(255), -- Email del encargado
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by VARCHAR(255),
  UNIQUE(review_id, center_id)
);

-- Crear tabla de resultados de mantenimiento
CREATE TABLE IF NOT EXISTS quarterly_maintenance_results (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES quarterly_maintenance_assignments(id) ON DELETE CASCADE,
  equipment_name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(100), -- 'maquina', 'instalacion', 'sistema'
  status VARCHAR(50) CHECK (status IN ('good', 'regular', 'bad', 'out_of_service')),
  issues_found TEXT,
  actions_required TEXT,
  priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_inv_assignments_review ON quarterly_inventory_assignments(review_id);
CREATE INDEX IF NOT EXISTS idx_inv_assignments_center ON quarterly_inventory_assignments(center_id);
CREATE INDEX IF NOT EXISTS idx_maint_assignments_review ON quarterly_maintenance_assignments(review_id);
CREATE INDEX IF NOT EXISTS idx_maint_assignments_center ON quarterly_maintenance_assignments(center_id);
