// setup-timeclock-db.js - Crear tablas de fichajes en Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfnjlmfziczimaohgkct.supabase.co';
const supabaseKey = 'sb_publishable_jZnZS-HRxXz_aOzcYY0mMA_Fl9xIwYZ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTimeclockTables() {
  console.log('🔧 Creando tablas del sistema de fichajes...');

  try {
    // 1. Crear tabla de tokens QR
    console.log('📱 Creando tabla qr_tokens...');
    const { error: qrError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS qr_tokens (
          id SERIAL PRIMARY KEY,
          token VARCHAR(255) UNIQUE NOT NULL,
          center_id INTEGER NOT NULL REFERENCES centers(id),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          is_used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (qrError) {
      console.error('❌ Error creando qr_tokens:', qrError);
    } else {
      console.log('✅ Tabla qr_tokens creada');
    }

    // 2. Crear tabla de registros de fichaje
    console.log('⏰ Creando tabla timeclock_records...');
    const { error: timeclockError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS timeclock_records (
          id SERIAL PRIMARY KEY,
          employee_id INTEGER NOT NULL REFERENCES employees(id),
          center_id INTEGER NOT NULL REFERENCES centers(id),
          clock_in TIMESTAMP WITH TIME ZONE,
          clock_out TIMESTAMP WITH TIME ZONE,
          total_hours DECIMAL(4,2),
          date DATE NOT NULL,
          location_lat DECIMAL(10,8),
          location_lng DECIMAL(11,8),
          device_info TEXT,
          qr_token_used VARCHAR(255),
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (timeclockError) {
      console.error('❌ Error creando timeclock_records:', timeclockError);
    } else {
      console.log('✅ Tabla timeclock_records creada');
    }

    // 3. Crear tabla de horarios de empleados
    console.log('📅 Creando tabla employee_schedules...');
    const { error: scheduleError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS employee_schedules (
          id SERIAL PRIMARY KEY,
          employee_id INTEGER NOT NULL REFERENCES employees(id),
          center_id INTEGER NOT NULL REFERENCES centers(id),
          day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (scheduleError) {
      console.error('❌ Error creando employee_schedules:', scheduleError);
    } else {
      console.log('✅ Tabla employee_schedules creada');
    }

    // 4. Crear función para calcular horas automáticamente
    console.log('⚙️ Creando función calculate_work_hours...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION calculate_work_hours()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.clock_in IS NOT NULL AND NEW.clock_out IS NOT NULL THEN
            NEW.total_hours = EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600.0;
          END IF;
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (functionError) {
      console.error('❌ Error creando función:', functionError);
    } else {
      console.log('✅ Función calculate_work_hours creada');
    }

    // 5. Crear trigger para calcular horas
    console.log('🔄 Creando trigger update_work_hours...');
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS update_work_hours ON timeclock_records;
        CREATE TRIGGER update_work_hours
          BEFORE INSERT OR UPDATE ON timeclock_records
          FOR EACH ROW
          EXECUTE FUNCTION calculate_work_hours();
      `
    });

    if (triggerError) {
      console.error('❌ Error creando trigger:', triggerError);
    } else {
      console.log('✅ Trigger update_work_hours creado');
    }

    // 6. Crear función para limpiar tokens expirados
    console.log('🧹 Creando función cleanup_expired_tokens...');
    const { error: cleanupError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
        RETURNS INTEGER AS $$
        DECLARE
          deleted_count INTEGER;
        BEGIN
          DELETE FROM qr_tokens WHERE expires_at < NOW();
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
          RETURN deleted_count;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (cleanupError) {
      console.error('❌ Error creando función cleanup:', cleanupError);
    } else {
      console.log('✅ Función cleanup_expired_tokens creada');
    }

    // 7. Crear índices para optimizar consultas
    console.log('📊 Creando índices...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_timeclock_employee_date ON timeclock_records(employee_id, date);',
      'CREATE INDEX IF NOT EXISTS idx_timeclock_center_date ON timeclock_records(center_id, date);',
      'CREATE INDEX IF NOT EXISTS idx_qr_tokens_center ON qr_tokens(center_id);',
      'CREATE INDEX IF NOT EXISTS idx_qr_tokens_expires ON qr_tokens(expires_at);'
    ];

    for (const indexSql of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (indexError) {
        console.error('❌ Error creando índice:', indexError);
      }
    }
    console.log('✅ Índices creados');

    console.log('🎉 ¡Sistema de fichajes configurado correctamente!');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar setup
createTimeclockTables();
