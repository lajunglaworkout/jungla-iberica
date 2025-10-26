-- Crear solo la primera tabla para probar
CREATE TABLE quarterly_maintenance_reviews (
  id BIGSERIAL PRIMARY KEY,
  center_id INTEGER NOT NULL,
  center_name TEXT NOT NULL,
  quarter TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'draft',
  deadline_date DATE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
