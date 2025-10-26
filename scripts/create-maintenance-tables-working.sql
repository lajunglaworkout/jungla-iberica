-- =====================================================
-- TABLAS PARA REVISIONES TRIMESTRALES DE MANTENIMIENTO
-- Script funcional - basado en estructura real de centers
-- =====================================================

-- 1. Tabla principal de revisiones trimestrales de mantenimiento
CREATE TABLE IF NOT EXISTS quarterly_maintenance_reviews (
  id BIGSERIAL PRIMARY KEY,
  center_id BIGINT NOT NULL,
  center_name TEXT NOT NULL,
  quarter TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  deadline_date DATE,
  created_by TEXT NOT NULL,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  total_zones INTEGER DEFAULT 9,
  total_concepts INTEGER DEFAULT 30,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de asignaciones de revisiones de mantenimiento
CREATE TABLE IF NOT EXISTS quarterly_maintenance_assignments (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL,
  center_id BIGINT NOT NULL,
  center_name TEXT NOT NULL,
  assigned_to TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de items de revisión de mantenimiento
CREATE TABLE IF NOT EXISTS quarterly_maintenance_items (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL,
  zone_id TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  concept_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'bien',
  observations TEXT,
  task_to_perform TEXT,
  task_priority TEXT DEFAULT 'media',
  photos_deterioro TEXT[],
  photos_reparacion TEXT[],
  is_critical BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de notificaciones de mantenimiento (para incidencias con plazo)
CREATE TABLE IF NOT EXISTS maintenance_review_notifications (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL,
  user_email TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  deadline_date TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear índices
CREATE INDEX IF NOT EXISTS idx_qmr_center_id ON quarterly_maintenance_reviews(center_id);
CREATE INDEX IF NOT EXISTS idx_qmr_status ON quarterly_maintenance_reviews(status);
CREATE INDEX IF NOT EXISTS idx_qmr_quarter_year ON quarterly_maintenance_reviews(quarter, year);

CREATE INDEX IF NOT EXISTS idx_qma_review_id ON quarterly_maintenance_assignments(review_id);
CREATE INDEX IF NOT EXISTS idx_qma_center_id ON quarterly_maintenance_assignments(center_id);
CREATE INDEX IF NOT EXISTS idx_qma_assigned_to ON quarterly_maintenance_assignments(assigned_to);

CREATE INDEX IF NOT EXISTS idx_qmi_assignment_id ON quarterly_maintenance_items(assignment_id);
CREATE INDEX IF NOT EXISTS idx_qmi_status ON quarterly_maintenance_items(status);

CREATE INDEX IF NOT EXISTS idx_mrn_user_email ON maintenance_review_notifications(user_email);
