-- =====================================================
-- MIGRACIÓN: Dashboard Ejecutivo Inteligente
-- Descripción: Tablas para objetivos estratégicos, alertas IA y métricas predictivas
-- =====================================================

-- 1. Tabla de Objetivos Estratégicos (Smart Objectives)
CREATE TABLE IF NOT EXISTS objetivos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    departamento TEXT NOT NULL,
    asignado_a UUID REFERENCES auth.users(id),
    tipo_asignacion TEXT CHECK (tipo_asignacion IN ('persona', 'departamento')),
    
    -- Plazos y Estado
    mes_objetivo DATE NOT NULL,
    fecha_limite DATE NOT NULL,
    estado TEXT CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'no_completado', 'en_riesgo')) DEFAULT 'pendiente',
    porcentaje_completitud INTEGER DEFAULT 0,
    
    -- Análisis y "Post-Mortem"
    motivo_no_cumplimiento TEXT,
    acciones_correctivas TEXT,
    
    -- Inteligencia / Metadata Predictiva
    impacto_negocio INTEGER CHECK (impacto_negocio BETWEEN 1 AND 10) DEFAULT 5,
    dificultad INTEGER CHECK (dificultad BETWEEN 1 AND 10) DEFAULT 5,
    probabilidad_cumplimiento INTEGER DEFAULT NULL, -- Calculado por IA (0-100)
    riesgo_calculado TEXT CHECK (riesgo_calculado IN ('bajo', 'medio', 'alto', 'critico')) DEFAULT 'bajo',
    
    -- Trazabilidad
    reunion_origen_id BIGINT, -- Link opcional a reuniones
    objetivo_padre_id UUID REFERENCES objetivos(id),
    
    creado_por UUID REFERENCES auth.users(id),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Alertas Automáticas (Smart Alerts)
CREATE TABLE IF NOT EXISTS alertas_automaticas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_alerta TEXT NOT NULL, -- 'objetivo_en_riesgo', 'reunion_necesaria', etc.
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    nivel_urgencia TEXT CHECK (nivel_urgencia IN ('info', 'warning', 'urgent', 'critical')),
    
    -- Contexto
    departamento_afectado TEXT,
    objetivo_relacionado_id UUID REFERENCES objetivos(id),
    
    -- Estado
    estado TEXT CHECK (estado IN ('activa', 'vista', 'resuelta', 'ignorada')) DEFAULT 'activa',
    accion_recomendada TEXT,
    es_automatica BOOLEAN DEFAULT TRUE,
    
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    vista_en TIMESTAMP WITH TIME ZONE,
    resuelta_en TIMESTAMP WITH TIME ZONE
);

-- 3. Tabla de Métricas por Departamento (Instantáneas Mensuales)
CREATE TABLE IF NOT EXISTS metricas_departamento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    departamento TEXT NOT NULL,
    mes DATE NOT NULL, -- Primer día del mes
    
    -- Hard KPIs
    objetivos_totales INTEGER DEFAULT 0,
    objetivos_completados INTEGER DEFAULT 0,
    objetivos_en_riesgo INTEGER DEFAULT 0,
    
    -- Soft KPIs / Calculados
    tasa_cumplimiento DECIMAL(5,2),
    tiempo_promedio_resolucion DECIMAL(5,2), -- Días
    efectividad_reuniones DECIMAL(5,2), -- 0-10
    
    -- Predicciones
    tendencia TEXT CHECK (tendencia IN ('mejorando', 'estable', 'empeorando')),
    prediccion_siguiente_mes DECIMAL(5,2),
    score_rendimiento INTEGER, -- 0-100
    
    calculado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_automaticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_departamento ENABLE ROW LEVEL SECURITY;

-- Políticas Simples (Acceso total para usuarios autenticados por ahora)
CREATE POLICY "Acceso total a objetivos" ON objetivos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total a alertas" ON alertas_automaticas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total a métricas" ON metricas_departamento FOR ALL USING (auth.role() = 'authenticated');

-- Índices
CREATE INDEX IF NOT EXISTS idx_objetivos_departamento ON objetivos(departamento);
CREATE INDEX IF NOT EXISTS idx_objetivos_estado ON objetivos(estado);
CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas_automaticas(estado);
