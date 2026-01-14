-- ============================================
-- SISTEMA DE NOTIFICACIONES - La Jungla CRM
-- Versión 2: Con DROP IF EXISTS para evitar conflictos
-- ============================================

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Eliminar tabla si existe para recrearla limpia
DROP TABLE IF EXISTS notifications;

-- Tipo ENUM para tipos de notificación (ignorar si ya existe)
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'incident',
        'event', 
        'message',
        'task',
        'system',
        'vacation'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipo ENUM para prioridades (ignorar si ya existe)
DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM (
        'low',
        'normal',
        'high',
        'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabla principal de notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type notification_type NOT NULL DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    body TEXT,
    link VARCHAR(500),
    is_read BOOLEAN NOT NULL DEFAULT false,
    priority notification_priority NOT NULL DEFAULT 'normal',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_dates CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Índices para optimizar consultas
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT
    USING (
        user_id = (SELECT id FROM employees WHERE email = auth.jwt() ->> 'email' LIMIT 1)
    );

-- Política UPDATE: Los usuarios pueden actualizar sus propias notificaciones
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE
    USING (
        user_id = (SELECT id FROM employees WHERE email = auth.jwt() ->> 'email' LIMIT 1)
    );

-- Política DELETE: Los usuarios pueden eliminar sus propias notificaciones
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE
    USING (
        user_id = (SELECT id FROM employees WHERE email = auth.jwt() ->> 'email' LIMIT 1)
    );

-- Política INSERT: Permitir inserción desde el sistema
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT
    WITH CHECK (true);

-- Habilitar Realtime para la tabla (ignorar error si ya está añadida)
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Función para limpiar notificaciones expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función helper para crear notificaciones
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id INTEGER,
    p_type notification_type,
    p_title VARCHAR(255),
    p_body TEXT DEFAULT NULL,
    p_link VARCHAR(500) DEFAULT NULL,
    p_priority notification_priority DEFAULT 'normal',
    p_metadata JSONB DEFAULT '{}',
    p_expires_in_hours INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
    expiry TIMESTAMP WITH TIME ZONE;
BEGIN
    IF p_expires_in_hours IS NOT NULL THEN
        expiry := NOW() + (p_expires_in_hours || ' hours')::INTERVAL;
    END IF;
    
    INSERT INTO notifications (user_id, type, title, body, link, priority, metadata, expires_at)
    VALUES (p_user_id, p_type, p_title, p_body, p_link, p_priority, p_metadata, expiry)
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios
COMMENT ON TABLE notifications IS 'Sistema de notificaciones para usuarios del CRM';
COMMENT ON COLUMN notifications.type IS 'Tipo: incident, event, message, task, system, vacation';
COMMENT ON COLUMN notifications.priority IS 'Prioridad: low, normal, high, urgent';
COMMENT ON COLUMN notifications.link IS 'Módulo destino al hacer clic';
COMMENT ON COLUMN notifications.metadata IS 'Datos adicionales en JSON';
