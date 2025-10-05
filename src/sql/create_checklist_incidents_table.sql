-- Crear tabla checklist_incidents para almacenar incidencias reportadas desde el checklist
-- Esta tabla almacena las incidencias con imágenes y derivación automática

CREATE TABLE IF NOT EXISTS checklist_incidents (
    id BIGSERIAL PRIMARY KEY,
    center_id TEXT NOT NULL,
    center_name TEXT NOT NULL,
    reporter_id TEXT,
    reporter_name TEXT NOT NULL,
    incident_type TEXT NOT NULL CHECK (incident_type IN ('maintenance', 'logistics', 'hr', 'security')),
    department TEXT NOT NULL,
    responsible TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'critica')),
    status TEXT NOT NULL DEFAULT 'abierta' CHECK (status IN ('abierta', 'en_proceso', 'resuelta', 'cerrada')),
    
    -- Campos específicos para logística
    inventory_item TEXT,
    inventory_quantity INTEGER,
    
    -- Campos para imágenes
    has_images BOOLEAN DEFAULT FALSE,
    image_urls TEXT[], -- Array de URLs de imágenes
    
    -- Campos de notificación automática
    auto_notify TEXT[], -- Array de emails para notificar
    notified_at TIMESTAMPTZ,
    
    -- Campos de resolución
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_checklist_incidents_center ON checklist_incidents(center_id);
CREATE INDEX IF NOT EXISTS idx_checklist_incidents_type ON checklist_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_checklist_incidents_status ON checklist_incidents(status);
CREATE INDEX IF NOT EXISTS idx_checklist_incidents_priority ON checklist_incidents(priority);
CREATE INDEX IF NOT EXISTS idx_checklist_incidents_date ON checklist_incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_checklist_incidents_reporter ON checklist_incidents(reporter_id);

-- Comentarios para documentar la tabla
COMMENT ON TABLE checklist_incidents IS 'Almacena incidencias reportadas desde el sistema de checklist';
COMMENT ON COLUMN checklist_incidents.center_id IS 'ID del centro donde ocurre la incidencia';
COMMENT ON COLUMN checklist_incidents.incident_type IS 'Tipo de incidencia: maintenance, logistics, hr, security';
COMMENT ON COLUMN checklist_incidents.department IS 'Departamento responsable de resolver la incidencia';
COMMENT ON COLUMN checklist_incidents.priority IS 'Prioridad: baja, media, alta, critica';
COMMENT ON COLUMN checklist_incidents.inventory_item IS 'Artículo de inventario afectado (solo para logística)';
COMMENT ON COLUMN checklist_incidents.image_urls IS 'URLs de las imágenes adjuntas';
COMMENT ON COLUMN checklist_incidents.auto_notify IS 'Emails que deben ser notificados automáticamente';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_checklist_incidents_updated_at ON checklist_incidents;
CREATE TRIGGER update_checklist_incidents_updated_at
    BEFORE UPDATE ON checklist_incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener estadísticas de incidencias por centro
CREATE OR REPLACE FUNCTION get_incident_stats_by_center(center_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    center_id TEXT,
    center_name TEXT,
    total_incidents BIGINT,
    open_incidents BIGINT,
    resolved_incidents BIGINT,
    critical_incidents BIGINT,
    avg_resolution_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.center_id,
        ci.center_name,
        COUNT(*) as total_incidents,
        COUNT(*) FILTER (WHERE ci.status IN ('abierta', 'en_proceso')) as open_incidents,
        COUNT(*) FILTER (WHERE ci.status IN ('resuelta', 'cerrada')) as resolved_incidents,
        COUNT(*) FILTER (WHERE ci.priority = 'critica') as critical_incidents,
        AVG(ci.resolved_at - ci.created_at) FILTER (WHERE ci.resolved_at IS NOT NULL) as avg_resolution_time
    FROM checklist_incidents ci
    WHERE (center_filter IS NULL OR ci.center_id = center_filter)
    GROUP BY ci.center_id, ci.center_name
    ORDER BY total_incidents DESC;
END;
$$ LANGUAGE plpgsql;
