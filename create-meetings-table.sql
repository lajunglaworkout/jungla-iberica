-- Crear tabla de reuniones para La Jungla CRM
-- Esta tabla almacena todas las reuniones estratégicas del CEO

CREATE TABLE IF NOT EXISTS public.meetings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'weekly', -- 'weekly', 'monthly', 'quarterly'
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER,
    
    -- Participantes
    participants TEXT[], -- Array de emails de participantes
    leader_email VARCHAR(255),
    
    -- Contenido de la reunión
    agenda TEXT,
    objectives TEXT[],
    kpis JSONB, -- KPIs específicos de la reunión
    tasks JSONB, -- Tareas asignadas durante la reunión
    notes TEXT,
    summary TEXT,
    
    -- Estado y seguimiento
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    completion_percentage INTEGER DEFAULT 0,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    
    -- Índices para mejorar rendimiento
    CONSTRAINT meetings_department_check CHECK (department IN (
        'Dirección', 'RRHH y Procedimientos', 'Logística', 
        'Contabilidad y Ventas', 'Marketing', 'Eventos', 
        'Online', 'I+D'
    )),
    CONSTRAINT meetings_type_check CHECK (type IN ('weekly', 'monthly', 'quarterly')),
    CONSTRAINT meetings_status_check CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_meetings_date ON public.meetings(date);
CREATE INDEX IF NOT EXISTS idx_meetings_department ON public.meetings(department);
CREATE INDEX IF NOT EXISTS idx_meetings_type ON public.meetings(type);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON public.meetings(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_meetings_updated_at
    BEFORE UPDATE ON public.meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_meetings_updated_at();

-- Insertar algunas reuniones de ejemplo para testing
INSERT INTO public.meetings (
    title, department, type, date, start_time, end_time, 
    participants, leader_email, agenda, status, created_by
) VALUES 
(
    'Revisión Semanal Dirección',
    'Dirección',
    'weekly',
    CURRENT_DATE + INTERVAL '1 day',
    '10:00:00',
    '11:00:00',
    ARRAY['carlossuarezparra@gmail.com'],
    'carlossuarezparra@gmail.com',
    'Revisión de KPIs semanales y tareas pendientes',
    'scheduled',
    'carlossuarezparra@gmail.com'
),
(
    'Reunión RRHH Semanal',
    'RRHH y Procedimientos',
    'weekly',
    CURRENT_DATE + INTERVAL '2 days',
    '09:30:00',
    '10:30:00',
    ARRAY['rrhhlajungla@gmail.com', 'carlossuarezparra@gmail.com'],
    'rrhhlajungla@gmail.com',
    'Revisión de ausencias, incidencias y procedimientos',
    'scheduled',
    'carlossuarezparra@gmail.com'
),
(
    'Revisión Marketing Mensual',
    'Marketing',
    'monthly',
    CURRENT_DATE + INTERVAL '7 days',
    '11:00:00',
    '12:00:00',
    ARRAY['lajunglaworkoutmk@gmail.com', 'carlossuarezparra@gmail.com'],
    'lajunglaworkoutmk@gmail.com',
    'Análisis de contenido publicado y estrategia mensual',
    'scheduled',
    'carlossuarezparra@gmail.com'
);

-- Comentarios para documentación
COMMENT ON TABLE public.meetings IS 'Tabla para gestionar reuniones estratégicas del CEO con departamentos';
COMMENT ON COLUMN public.meetings.kpis IS 'KPIs específicos revisados en la reunión (formato JSON)';
COMMENT ON COLUMN public.meetings.tasks IS 'Tareas asignadas durante la reunión (formato JSON)';
COMMENT ON COLUMN public.meetings.participants IS 'Array de emails de los participantes';
