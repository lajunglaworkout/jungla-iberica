-- =====================================================
-- MIGRACIÓN: Sistema de Analytics de Reuniones
-- Fecha: 2025-11-14
-- Descripción: Añade tablas para métricas, objetivos y cuellos de botella
-- =====================================================

-- 1. Tabla de métricas de reuniones
CREATE TABLE IF NOT EXISTS meeting_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  departamento TEXT NOT NULL,
  tipo_reunion TEXT CHECK (tipo_reunion IN ('FISICA', 'VIDEOLLAMADA')),
  
  -- Métricas de tareas recurrentes
  tareas_recurrentes_total INTEGER DEFAULT 0,
  tareas_recurrentes_completadas INTEGER DEFAULT 0,
  porcentaje_cumplimiento DECIMAL(5,2) DEFAULT 0,
  
  -- Métricas de tareas anteriores
  tareas_anteriores_total INTEGER DEFAULT 0,
  tareas_anteriores_completadas INTEGER DEFAULT 0,
  tareas_anteriores_pendientes INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de objetivos de reuniones
CREATE TABLE IF NOT EXISTS meeting_objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  departamento TEXT NOT NULL,
  
  -- Datos del objetivo
  nombre TEXT NOT NULL,
  valor_objetivo TEXT, -- Puede ser número o texto
  tipo_objetivo TEXT CHECK (tipo_objetivo IN ('numero', 'texto', 'porcentaje')),
  unidad TEXT, -- Ej: "€", "personas", "horas"
  
  -- Para comparar con reunión anterior
  valor_anterior TEXT,
  cumplido BOOLEAN DEFAULT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de cuellos de botella (tareas no completadas)
CREATE TABLE IF NOT EXISTS meeting_bottlenecks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  departamento TEXT NOT NULL,
  
  -- Datos del cuello de botella
  tarea_titulo TEXT NOT NULL,
  tarea_id INTEGER, -- Referencia a la tarea original si existe
  motivo TEXT NOT NULL,
  asignado_a TEXT,
  fecha_limite DATE,
  
  -- Clasificación automática (para analytics)
  categoria TEXT, -- Ej: "Recursos", "Dependencias", "Prioridad"
  recurrente BOOLEAN DEFAULT FALSE, -- Si aparece en múltiples reuniones
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Añadir campos a tabla meetings existente
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS tipo_reunion TEXT CHECK (tipo_reunion IN ('FISICA', 'VIDEOLLAMADA')),
ADD COLUMN IF NOT EXISTS porcentaje_cumplimiento DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tiene_cuellos_botella BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS numero_cuellos_botella INTEGER DEFAULT 0;

-- 5. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_meeting_metrics_departamento ON meeting_metrics(departamento);
CREATE INDEX IF NOT EXISTS idx_meeting_metrics_created_at ON meeting_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_meeting_objectives_departamento ON meeting_objectives(departamento);
CREATE INDEX IF NOT EXISTS idx_meeting_objectives_nombre ON meeting_objectives(nombre);
CREATE INDEX IF NOT EXISTS idx_meeting_bottlenecks_departamento ON meeting_bottlenecks(departamento);
CREATE INDEX IF NOT EXISTS idx_meeting_bottlenecks_recurrente ON meeting_bottlenecks(recurrente);
CREATE INDEX IF NOT EXISTS idx_meetings_tipo_reunion ON meetings(tipo_reunion);
CREATE INDEX IF NOT EXISTS idx_meetings_cumplimiento ON meetings(porcentaje_cumplimiento);

-- 6. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_meeting_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para updated_at
DROP TRIGGER IF EXISTS meeting_metrics_updated_at ON meeting_metrics;
CREATE TRIGGER meeting_metrics_updated_at
  BEFORE UPDATE ON meeting_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_metrics_updated_at();

-- 8. Función para detectar cuellos de botella recurrentes
CREATE OR REPLACE FUNCTION mark_recurring_bottlenecks()
RETURNS VOID AS $$
BEGIN
  -- Marcar como recurrente si la misma tarea aparece en 2+ reuniones
  UPDATE meeting_bottlenecks mb1
  SET recurrente = TRUE
  WHERE EXISTS (
    SELECT 1 
    FROM meeting_bottlenecks mb2
    WHERE mb2.tarea_titulo = mb1.tarea_titulo
      AND mb2.departamento = mb1.departamento
      AND mb2.id != mb1.id
  );
END;
$$ LANGUAGE plpgsql;

-- 9. Vista para analytics de departamentos
CREATE OR REPLACE VIEW department_performance AS
SELECT 
  mm.departamento,
  COUNT(DISTINCT mm.meeting_id) as total_reuniones,
  AVG(mm.porcentaje_cumplimiento) as cumplimiento_promedio,
  SUM(mm.tareas_recurrentes_completadas) as total_tareas_completadas,
  SUM(mm.tareas_recurrentes_total) as total_tareas,
  COUNT(mb.id) as total_cuellos_botella,
  COUNT(CASE WHEN mb.recurrente = TRUE THEN 1 END) as cuellos_botella_recurrentes
FROM meeting_metrics mm
LEFT JOIN meeting_bottlenecks mb ON mm.meeting_id = mb.meeting_id
GROUP BY mm.departamento;

-- 10. Vista para objetivos por departamento
CREATE OR REPLACE VIEW department_objectives_tracking AS
SELECT 
  mo.departamento,
  mo.nombre as objetivo,
  mo.tipo_objetivo,
  mo.unidad,
  AVG(CASE WHEN mo.tipo_objetivo IN ('numero', 'porcentaje') 
    THEN CAST(mo.valor_objetivo AS DECIMAL) 
    ELSE NULL END) as valor_promedio,
  COUNT(CASE WHEN mo.cumplido = TRUE THEN 1 END) as veces_cumplido,
  COUNT(*) as total_mediciones
FROM meeting_objectives mo
WHERE mo.created_at >= NOW() - INTERVAL '3 months'
GROUP BY mo.departamento, mo.nombre, mo.tipo_objetivo, mo.unidad;

-- 11. Comentarios para documentación
COMMENT ON TABLE meeting_metrics IS 'Métricas de cumplimiento por reunión';
COMMENT ON TABLE meeting_objectives IS 'Objetivos definidos en cada reunión';
COMMENT ON TABLE meeting_bottlenecks IS 'Tareas no completadas y sus motivos (cuellos de botella)';
COMMENT ON VIEW department_performance IS 'Vista agregada de rendimiento por departamento';
COMMENT ON VIEW department_objectives_tracking IS 'Seguimiento de objetivos por departamento';

-- 12. Permisos (ajustar según tus necesidades)
-- Por ahora, permitir a usuarios autenticados
ALTER TABLE meeting_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_bottlenecks ENABLE ROW LEVEL SECURITY;

-- Política: usuarios autenticados pueden ver y crear
CREATE POLICY "Usuarios autenticados pueden ver métricas" ON meeting_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear métricas" ON meeting_metrics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver objetivos" ON meeting_objectives
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear objetivos" ON meeting_objectives
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver cuellos de botella" ON meeting_bottlenecks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear cuellos de botella" ON meeting_bottlenecks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
