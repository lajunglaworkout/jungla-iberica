-- =====================================================
-- SISTEMA DE MANTENIMIENTO - LA JUNGLA CRM
-- Tablas para inspecciones mensuales digitalizadas
-- =====================================================

-- Función para actualizar timestamps (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TABLA: MAINTENANCE_ZONES
-- Zonas de inspección (Exterior, Entrenamiento, Común)
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_zones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6',
    icon VARCHAR(10) DEFAULT '🏢',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: MAINTENANCE_CONCEPTS
-- Conceptos específicos por zona (barras, pintura, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_concepts (
    id VARCHAR(50) PRIMARY KEY,
    zone_id VARCHAR(50) REFERENCES maintenance_zones(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    inspection_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (inspection_frequency IN ('monthly', 'quarterly', 'biannual', 'annual')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: MAINTENANCE_INSPECTIONS
-- Inspecciones mensuales por centro
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id VARCHAR(50) NOT NULL,
    center_name VARCHAR(100) NOT NULL,
    inspector_name VARCHAR(100) NOT NULL,
    inspector_email VARCHAR(100) NOT NULL,
    inspection_date DATE NOT NULL,
    inspection_month VARCHAR(7) NOT NULL, -- "2025-02"
    inspection_year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'reviewed')),
    total_items INTEGER DEFAULT 0,
    items_ok INTEGER DEFAULT 0,
    items_regular INTEGER DEFAULT 0,
    items_bad INTEGER DEFAULT 0,
    overall_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    notes TEXT,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices únicos para evitar duplicados
    UNIQUE(center_id, inspection_month)
);

-- =====================================================
-- TABLA: MAINTENANCE_INSPECTION_ITEMS
-- Items específicos de cada inspección
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_inspection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES maintenance_inspections(id) ON DELETE CASCADE,
    zone_id VARCHAR(50) REFERENCES maintenance_zones(id),
    zone_name VARCHAR(100) NOT NULL,
    concept_id VARCHAR(50) REFERENCES maintenance_concepts(id),
    concept_name VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('bien', 'regular', 'mal')),
    observations TEXT,
    task_to_perform TEXT,
    task_status VARCHAR(20) DEFAULT 'pendiente' CHECK (task_status IN ('pendiente', 'en_progreso', 'completada')),
    task_priority VARCHAR(20) DEFAULT 'media' CHECK (task_priority IN ('baja', 'media', 'alta', 'critica')),
    estimated_cost DECIMAL(10,2),
    assigned_to VARCHAR(100),
    due_date DATE,
    completed_date DATE,
    
    -- SISTEMA DE FOTOS OBLIGATORIAS
    photos_deterioro TEXT[] DEFAULT '{}', -- URLs fotos del deterioro (OBLIGATORIAS para MAL/REGULAR)
    photos_reparacion TEXT[] DEFAULT '{}', -- URLs fotos de reparación (OBLIGATORIAS para cerrar tarea)
    photos_required BOOLEAN DEFAULT false, -- Si requiere fotos obligatorias
    can_close_task BOOLEAN DEFAULT true, -- Si se puede cerrar (requiere foto reparación)
    
    -- NOTIFICACIONES A BENI
    beni_notified BOOLEAN DEFAULT false, -- Si se notificó a Beni
    beni_notification_sent_at TIMESTAMP WITH TIME ZONE, -- Cuándo se envió notificación
    is_critical_for_checklist BOOLEAN DEFAULT false, -- Si debe aparecer en check-list
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: MAINTENANCE_TASKS
-- Tareas derivadas de las inspecciones
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_item_id UUID REFERENCES maintenance_inspection_items(id) ON DELETE CASCADE,
    center_id VARCHAR(50) NOT NULL,
    center_name VARCHAR(100) NOT NULL,
    zone_name VARCHAR(100) NOT NULL,
    concept_name VARCHAR(200) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'critica')),
    status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
    assigned_to VARCHAR(100),
    assigned_by VARCHAR(100) NOT NULL,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    due_date DATE,
    started_date DATE,
    completed_date DATE,
    notes TEXT,
    photos_before TEXT[],
    photos_after TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: MAINTENANCE_ALERTS
-- Alertas del sistema de mantenimiento
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('overdue_inspection', 'critical_issue', 'overdue_task', 'budget_exceeded')),
    center_id VARCHAR(50) NOT NULL,
    center_name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    related_id UUID, -- inspection_id o task_id
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: MAINTENANCE_REPORTS
-- Reportes generados del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id VARCHAR(50) NOT NULL,
    center_name VARCHAR(100) NOT NULL,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('monthly', 'quarterly', 'annual')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_inspections INTEGER DEFAULT 0,
    total_issues INTEGER DEFAULT 0,
    issues_resolved INTEGER DEFAULT 0,
    issues_pending INTEGER DEFAULT 0,
    total_cost DECIMAL(12,2) DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    score_trend VARCHAR(20) DEFAULT 'stable' CHECK (score_trend IN ('improving', 'stable', 'declining')),
    cost_trend VARCHAR(20) DEFAULT 'stable' CHECK (cost_trend IN ('increasing', 'stable', 'decreasing')),
    issues_trend VARCHAR(20) DEFAULT 'stable' CHECK (issues_trend IN ('increasing', 'stable', 'decreasing')),
    generated_by VARCHAR(100) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Inspecciones
CREATE INDEX IF NOT EXISTS idx_inspections_center ON maintenance_inspections(center_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON maintenance_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_inspections_month ON maintenance_inspections(inspection_month);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON maintenance_inspections(status);

-- Items de inspección
CREATE INDEX IF NOT EXISTS idx_inspection_items_inspection ON maintenance_inspection_items(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_zone ON maintenance_inspection_items(zone_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_status ON maintenance_inspection_items(status);
CREATE INDEX IF NOT EXISTS idx_inspection_items_task_status ON maintenance_inspection_items(task_status);

-- Tareas
CREATE INDEX IF NOT EXISTS idx_tasks_center ON maintenance_tasks(center_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON maintenance_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON maintenance_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON maintenance_tasks(due_date);

-- Alertas
CREATE INDEX IF NOT EXISTS idx_alerts_center ON maintenance_alerts(center_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON maintenance_alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON maintenance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON maintenance_alerts(acknowledged);

-- =====================================================
-- TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- =====================================================

CREATE TRIGGER update_maintenance_zones_updated_at 
    BEFORE UPDATE ON maintenance_zones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_concepts_updated_at 
    BEFORE UPDATE ON maintenance_concepts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_inspections_updated_at 
    BEFORE UPDATE ON maintenance_inspections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_inspection_items_updated_at 
    BEFORE UPDATE ON maintenance_inspection_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_tasks_updated_at 
    BEFORE UPDATE ON maintenance_tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS INICIALES: ZONAS
-- =====================================================

INSERT INTO maintenance_zones (id, name, description, color, icon) 
VALUES 
    ('entrenamiento', 'ZONA DE ENTRENAMIENTO', 'Área principal de entrenamiento y actividades', '#f59e0b', '💪'),
    ('exterior', 'ZONA EXTERIOR', 'Instalaciones exteriores (si las hay)', '#10b981', '🌿'),
    ('paredes', 'PAREDES', 'Estado de pintura de paredes interiores', '#8b5cf6', '🎨'),
    ('iluminacion', 'ILUMINACIÓN', 'Sistema de iluminación general y LED', '#fbbf24', '💡'),
    ('accesos', 'PUERTAS Y ACCESOS', 'Puertas, cristales y ventanas', '#06b6d4', '🚪'),
    ('duchas', 'DUCHAS', 'Sistema de duchas (especificar número)', '#3b82f6', '🚿'),
    ('aseos', 'ASEOS', 'Aseos diferenciados por género', '#6366f1', '🚻'),
    ('recepcion', 'RECEPCIÓN', 'Área de recepción y atención al cliente', '#ec4899', '🏪'),
    ('servicios', 'SALAS DE SERVICIO', 'Nutrición y fisioterapia', '#10b981', '🏥')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DATOS INICIALES: CONCEPTOS
-- =====================================================

INSERT INTO maintenance_concepts (id, zone_id, name, description, inspection_frequency, priority) 
VALUES 
    -- ZONA DE ENTRENAMIENTO
    ('ent_suelo', 'entrenamiento', 'Suelo', 'Estado del suelo de entrenamiento', 'monthly', 'high'),
    ('ent_soldaduras', 'entrenamiento', 'Revisión de soldaduras', 'Estado de soldaduras en estructura de entrenamiento', 'monthly', 'high'),
    ('ent_pintura_estructura', 'entrenamiento', 'Pintura de estructura', 'Estado de pintura en estructura de entrenamiento', 'monthly', 'medium'),
    ('ent_ventilacion', 'entrenamiento', 'Sistema de ventilación', 'Funcionamiento del sistema de ventilación', 'monthly', 'high'),
    
    -- ZONA EXTERIOR
    ('ext_cesped', 'exterior', 'Césped', 'Estado del césped exterior', 'monthly', 'medium'),
    ('ext_estructura', 'exterior', 'Estructura de entrenamiento', 'Estado de estructura exterior de entrenamiento', 'monthly', 'high'),
    
    -- PAREDES
    ('par_pintura', 'paredes', 'Estado de pintura', 'Estado de pintura de paredes interiores', 'monthly', 'medium'),
    
    -- ILUMINACIÓN
    ('ilu_sala', 'iluminacion', 'Iluminación sala', 'Sistema de iluminación general de la sala', 'monthly', 'medium'),
    ('ilu_led', 'iluminacion', 'Iluminación LED', 'Sistema de iluminación LED específico', 'monthly', 'medium'),
    
    -- PUERTAS Y ACCESOS
    ('acc_puertas', 'accesos', 'Puertas', 'Estado de puertas y mecanismos', 'monthly', 'medium'),
    ('acc_cristales', 'accesos', 'Cristales y ventanas', 'Estado de cristales y ventanas', 'monthly', 'medium'),
    
    -- DUCHAS
    ('duc_ducha_1', 'duchas', 'Ducha 1', 'Estado específico de la ducha número 1', 'monthly', 'high'),
    ('duc_ducha_2', 'duchas', 'Ducha 2', 'Estado específico de la ducha número 2', 'monthly', 'high'),
    ('duc_ducha_3', 'duchas', 'Ducha 3', 'Estado específico de la ducha número 3', 'monthly', 'high'),
    ('duc_ducha_4', 'duchas', 'Ducha 4', 'Estado específico de la ducha número 4', 'monthly', 'high'),
    ('duc_general', 'duchas', 'Estado general duchas', 'Deterioro común en todas las duchas', 'monthly', 'high'),
    
    -- ASEOS
    ('ase_hombre', 'aseos', 'Aseo hombre', 'Estado del aseo masculino', 'monthly', 'high'),
    ('ase_mujer', 'aseos', 'Aseo mujer', 'Estado del aseo femenino', 'monthly', 'high'),
    
    -- RECEPCIÓN
    ('rec_general', 'recepcion', 'Estado general recepción', 'Estado general del área de recepción', 'monthly', 'medium'),
    
    -- SALAS DE SERVICIO
    ('ser_nutricion', 'servicios', 'Sala de nutrición', 'Estado de la sala de servicio de nutrición', 'monthly', 'medium'),
    ('ser_fisioterapia', 'servicios', 'Sala de fisioterapia', 'Estado de la sala de fisioterapia', 'monthly', 'medium')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DATOS DE EJEMPLO: INSPECCIÓN
-- =====================================================

-- Insertar inspección de ejemplo para Centro Sevilla
INSERT INTO maintenance_inspections (
    center_id, center_name, inspector_name, inspector_email, 
    inspection_date, inspection_month, inspection_year, 
    status, total_items, items_ok, items_regular, items_bad, overall_score, notes
) VALUES (
    'sevilla', 'Centro Sevilla', 'Carlos Ruiz', 'carlos.sevilla@lajungla.com',
    '2025-02-07', '2025-02', 2025,
    'completed', 12, 8, 3, 1, 75.5, 'Inspección mensual completada. Zona calistenia necesita atención.'
) ON CONFLICT (center_id, inspection_month) DO NOTHING;

-- Obtener el ID de la inspección recién creada para los items
DO $$
DECLARE
    inspection_uuid UUID;
BEGIN
    SELECT id INTO inspection_uuid FROM maintenance_inspections 
    WHERE center_id = 'sevilla' AND inspection_month = '2025-02';
    
    -- Insertar items de ejemplo basados en las nuevas zonas
    INSERT INTO maintenance_inspection_items (
        inspection_id, zone_id, zone_name, concept_id, concept_name, 
        status, observations, task_to_perform, task_status, task_priority,
        photos_required, beni_notified, is_critical_for_checklist
    ) VALUES 
        (inspection_uuid, 'entrenamiento', 'ZONA DE ENTRENAMIENTO', 'ent_suelo', 'Suelo', 'mal', 'quitar tornillo funcional por las paj', 'reparar suelo de entrenamiento', 'pendiente', 'alta', true, true, true),
        (inspection_uuid, 'entrenamiento', 'ZONA DE ENTRENAMIENTO', 'ent_soldaduras', 'Revisión de soldaduras', 'regular', 'pintar barras nuevas', 'pintar y rascar soldaduras', 'pendiente', 'media', true, false, false),
        (inspection_uuid, 'entrenamiento', 'ZONA DE ENTRENAMIENTO', 'ent_ventilacion', 'Sistema de ventilación', 'regular', 'panel viento', 'revisar panel de ventilación', 'pendiente', 'media', true, false, false),
        (inspection_uuid, 'duchas', 'DUCHAS', 'duc_ducha_1', 'Ducha 1', 'regular', 'espejo', 'pegar espejo', 'pendiente', 'media', true, false, false),
        (inspection_uuid, 'duchas', 'DUCHAS', 'duc_ducha_2', 'Ducha 2', 'regular', 'todos los baños', 'revisar estado general', 'pendiente', 'media', true, false, false),
        (inspection_uuid, 'duchas', 'DUCHAS', 'duc_general', 'Estado general duchas', 'mal', 'espejo roto', 'comprar y poner espejo', 'completada', 'alta', true, true, false),
        (inspection_uuid, 'aseos', 'ASEOS', 'ase_mujer', 'Aseo mujer', 'regular', 'madera', 'situar madera con barrera', 'pendiente', 'media', true, false, false),
        (inspection_uuid, 'aseos', 'ASEOS', 'ase_mujer', 'Aseo mujer', 'regular', 'madera subieta', 'coser o clavar las maderas', 'pendiente', 'media', true, false, false),
        (inspection_uuid, 'aseos', 'ASEOS', 'ase_mujer', 'Aseo mujer', 'regular', 'toca fundidos', 'colocar espejo', 'pendiente', 'media', true, false, false),
        (inspection_uuid, 'aseos', 'ASEOS', 'ase_hombre', 'Aseo hombre', 'regular', 'espejo', 'pegar madera', 'pendiente', 'media', true, false, false),
        (inspection_uuid, 'aseos', 'ASEOS', 'ase_hombre', 'Aseo hombre', 'regular', 'poner punto de luz', 'un enchufe para ambientador', 'pendiente', 'media', true, false, false),
        (inspection_uuid, 'servicios', 'SALAS DE SERVICIO', 'ser_nutricion', 'Sala de nutrición', 'regular', 'revisar estado general', 'mantenimiento general', 'pendiente', 'media', true, false, false);
END $$;

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE maintenance_zones IS 'Zonas de inspección de mantenimiento (Exterior, Entrenamiento, Común)';
COMMENT ON TABLE maintenance_concepts IS 'Conceptos específicos a inspeccionar en cada zona';
COMMENT ON TABLE maintenance_inspections IS 'Inspecciones mensuales realizadas por los encargados';
COMMENT ON TABLE maintenance_inspection_items IS 'Items específicos evaluados en cada inspección';
COMMENT ON TABLE maintenance_tasks IS 'Tareas derivadas de las inspecciones de mantenimiento';
COMMENT ON TABLE maintenance_alerts IS 'Alertas automáticas del sistema de mantenimiento';
COMMENT ON TABLE maintenance_reports IS 'Reportes generados del sistema de mantenimiento';

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las tablas se crearon correctamente
SELECT 
    schemaname, tablename, tableowner 
FROM pg_tables 
WHERE tablename LIKE 'maintenance_%' 
ORDER BY tablename;

-- Verificar datos iniciales
SELECT 'Zonas' as tabla, count(*) as registros FROM maintenance_zones
UNION ALL
SELECT 'Conceptos' as tabla, count(*) as registros FROM maintenance_concepts
UNION ALL  
SELECT 'Inspecciones' as tabla, count(*) as registros FROM maintenance_inspections
UNION ALL
SELECT 'Items inspección' as tabla, count(*) as registros FROM maintenance_inspection_items;
