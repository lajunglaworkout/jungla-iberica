-- =====================================================
-- TABLAS PARA REVISIONES TRIMESTRALES DE MANTENIMIENTO
-- Copiando el patrón exacto de logística que funciona
-- =====================================================

-- 1. Tabla principal de revisiones de mantenimiento
CREATE TABLE IF NOT EXISTS quarterly_maintenance_reviews (
  id SERIAL PRIMARY KEY,
  quarter VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  deadline_date DATE,
  created_by VARCHAR(255) NOT NULL,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  total_centers INTEGER DEFAULT 0,
  completed_centers INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(quarter, year)
);

-- 2. Tabla de asignaciones de revisiones de mantenimiento
CREATE TABLE IF NOT EXISTS quarterly_maintenance_assignments (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES quarterly_maintenance_reviews(id) ON DELETE CASCADE,
  center_id INTEGER REFERENCES centers(id),
  center_name VARCHAR(255),
  assigned_to VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by VARCHAR(255),
  UNIQUE(review_id, center_id)
);

-- 3. Tabla de items de revisión de mantenimiento (zonas y conceptos)
CREATE TABLE IF NOT EXISTS quarterly_maintenance_items (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES quarterly_maintenance_assignments(id) ON DELETE CASCADE,
  zone_id VARCHAR(50) NOT NULL,
  zone_name VARCHAR(255) NOT NULL,
  concept_id VARCHAR(50) NOT NULL,
  concept_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'bien' CHECK (status IN ('bien', 'regular', 'mal')),
  observations TEXT,
  task_to_perform TEXT,
  task_priority VARCHAR(50) DEFAULT 'media' CHECK (task_priority IN ('baja', 'media', 'alta', 'critica')),
  photos_deterioro TEXT[],
  photos_reparacion TEXT[],
  is_critical BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de notificaciones de mantenimiento (para incidencias con plazo)
CREATE TABLE IF NOT EXISTS maintenance_review_notifications (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES quarterly_maintenance_reviews(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  deadline_date TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Crear índices
CREATE INDEX IF NOT EXISTS idx_qmr_quarter_year ON quarterly_maintenance_reviews(quarter, year);
CREATE INDEX IF NOT EXISTS idx_qmr_status ON quarterly_maintenance_reviews(status);

CREATE INDEX IF NOT EXISTS idx_qma_review_id ON quarterly_maintenance_assignments(review_id);
CREATE INDEX IF NOT EXISTS idx_qma_center_id ON quarterly_maintenance_assignments(center_id);
CREATE INDEX IF NOT EXISTS idx_qma_assigned_to ON quarterly_maintenance_assignments(assigned_to);

CREATE INDEX IF NOT EXISTS idx_qmi_assignment_id ON quarterly_maintenance_items(assignment_id);
CREATE INDEX IF NOT EXISTS idx_qmi_status ON quarterly_maintenance_items(status);

CREATE INDEX IF NOT EXISTS idx_mrn_user_email ON maintenance_review_notifications(user_email);
