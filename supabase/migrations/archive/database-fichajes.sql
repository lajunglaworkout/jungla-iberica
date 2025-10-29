-- Sistema de Fichajes La Jungla
-- Tabla para registros de fichaje de empleados

-- Tabla principal de fichajes
CREATE TABLE IF NOT EXISTS employee_timeclock (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    center_id BIGINT NOT NULL,
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    total_hours DECIMAL(5,2),
    date DATE NOT NULL,
    qr_token VARCHAR(255) NOT NULL,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    device_info JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'corrected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_employee_date UNIQUE(employee_id, date),
    CONSTRAINT valid_hours CHECK (total_hours >= 0 AND total_hours <= 24),
    CONSTRAINT valid_times CHECK (clock_out IS NULL OR clock_out > clock_in)
);

-- Tabla para tokens QR dinámicos por centro
CREATE TABLE IF NOT EXISTS center_qr_tokens (
    id BIGSERIAL PRIMARY KEY,
    center_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    INDEX idx_center_qr_active (center_id, is_active, expires_at),
    INDEX idx_token_lookup (token, expires_at)
);

-- Tabla para configuración de horarios por empleado
CREATE TABLE IF NOT EXISTS employee_schedules (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    center_id BIGINT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_employee_day UNIQUE(employee_id, day_of_week),
    CONSTRAINT valid_schedule_times CHECK (end_time > start_time)
);

-- Función para calcular horas trabajadas automáticamente
CREATE OR REPLACE FUNCTION calculate_work_hours()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo calcular si hay clock_out
    IF NEW.clock_out IS NOT NULL AND NEW.clock_in IS NOT NULL THEN
        NEW.total_hours = EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600.0;
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular horas automáticamente
DROP TRIGGER IF EXISTS trigger_calculate_hours ON employee_timeclock;
CREATE TRIGGER trigger_calculate_hours
    BEFORE INSERT OR UPDATE ON employee_timeclock
    FOR EACH ROW
    EXECUTE FUNCTION calculate_work_hours();

-- Función para generar token QR único
CREATE OR REPLACE FUNCTION generate_qr_token(p_center_id BIGINT)
RETURNS VARCHAR(255) AS $$
DECLARE
    new_token VARCHAR(255);
    token_exists BOOLEAN;
BEGIN
    LOOP
        -- Generar token único basado en timestamp, center_id y random
        new_token = ENCODE(
            DIGEST(
                CONCAT(
                    EXTRACT(EPOCH FROM NOW())::TEXT,
                    p_center_id::TEXT,
                    RANDOM()::TEXT
                ), 
                'sha256'
            ), 
            'hex'
        );
        
        -- Verificar si el token ya existe
        SELECT EXISTS(
            SELECT 1 FROM center_qr_tokens 
            WHERE token = new_token AND expires_at > NOW()
        ) INTO token_exists;
        
        -- Si no existe, salir del loop
        IF NOT token_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_token;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM center_qr_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 hour';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insertar horarios por defecto para empleados existentes (ejemplo)
INSERT INTO employee_schedules (employee_id, center_id, day_of_week, start_time, end_time)
SELECT 
    e.id as employee_id,
    e.center_id,
    generate_series(1, 5) as day_of_week, -- Lunes a Viernes
    '09:00:00'::TIME as start_time,
    '18:00:00'::TIME as end_time
FROM employees e
WHERE e.activo = true
ON CONFLICT (employee_id, day_of_week) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE employee_timeclock IS 'Registros de fichaje de entrada y salida de empleados';
COMMENT ON TABLE center_qr_tokens IS 'Tokens QR dinámicos por centro que cambian cada 5 minutos';
COMMENT ON TABLE employee_schedules IS 'Horarios programados por empleado y día de la semana';

COMMENT ON COLUMN employee_timeclock.qr_token IS 'Token QR usado para el fichaje';
COMMENT ON COLUMN employee_timeclock.total_hours IS 'Horas trabajadas calculadas automáticamente';
COMMENT ON COLUMN employee_timeclock.device_info IS 'Información del dispositivo móvil usado';
COMMENT ON COLUMN center_qr_tokens.expires_at IS 'Timestamp de expiración del token (5 minutos)';
