-- Script para crear/corregir la tabla checklist_incidents
-- Eliminar tabla si existe para recrearla con esquema correcto
DROP TABLE IF EXISTS checklist_incidents CASCADE;

-- Crear tabla checklist_incidents
CREATE TABLE checklist_incidents (
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
CREATE INDEX idx_checklist_incidents_center ON checklist_incidents(center_id);
CREATE INDEX idx_checklist_incidents_type ON checklist_incidents(incident_type);
CREATE INDEX idx_checklist_incidents_status ON checklist_incidents(status);
CREATE INDEX idx_checklist_incidents_priority ON checklist_incidents(priority);
CREATE INDEX idx_checklist_incidents_date ON checklist_incidents(created_at);
CREATE INDEX idx_checklist_incidents_reporter ON checklist_incidents(reporter_id);

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

-- Insertar algunos datos de ejemplo para testing
INSERT INTO checklist_incidents (
    center_id, center_name, reporter_name, incident_type, department, responsible,
    title, description, priority, status, auto_notify, notified_at
) VALUES
('sevilla', 'Centro Sevilla', 'Francisco Giráldez', 'maintenance', 'Mantenimiento', 'Responsable de Mantenimiento',
 'Aire acondicionado hace ruido', 'El aire acondicionado de la sala principal hace un ruido extraño desde esta mañana', 'alta', 'abierta',
 ARRAY['mantenimiento@lajungla.com'], NOW()),

('sevilla', 'Centro Sevilla', 'Francisco Giráldez', 'logistics', 'Logística', 'Encargado de Logística',
 'Goma elástica rota', 'Se ha roto una goma elástica de resistencia media en la zona de funcional', 'media', 'abierta',
 ARRAY['pedidoslajungla@gmail.com'], NOW()),

('jerez', 'Centro Jerez', 'Encargado Jerez', 'security', 'Dirección', 'Director',
 'Luz de emergencia parpadeando', 'La luz de emergencia del pasillo principal está parpadeando', 'critica', 'abierta',
 ARRAY['carlossuarezparra@gmail.com'], NOW());

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla checklist_incidents creada correctamente' as resultado;
SELECT COUNT(*) as registros_ejemplo FROM checklist_incidents;
