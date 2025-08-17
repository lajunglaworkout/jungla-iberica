// Script para verificar que las tablas de turnos y fichajes se crearon correctamente
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (usar las mismas variables del proyecto)
const supabaseUrl = 'https://xtqjbvgvfnxfwjcfhxkz.supabase.co';
const supabaseKey = 'SUPABASE_KEY_REMOVED';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  console.log('🔍 Verificando tablas de turnos y fichajes...\n');

  const tablesToCheck = [
    'shifts',
    'employee_shifts', 
    'time_records',
    'daily_attendance'
  ];

  for (const tableName of tablesToCheck) {
    try {
      console.log(`📋 Verificando tabla: ${tableName}`);
      
      // Intentar hacer una consulta simple para verificar que la tabla existe
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Error en tabla ${tableName}:`, error.message);
      } else {
        console.log(`✅ Tabla ${tableName} existe y tiene ${count || 0} registros`);
      }
    } catch (err) {
      console.log(`❌ Error verificando ${tableName}:`, err.message);
    }
  }

  // Verificar estructura específica de la tabla shifts
  console.log('\n🔧 Verificando estructura de tabla shifts...');
  try {
    const { data: shiftsData, error: shiftsError } = await supabase
      .from('shifts')
      .select('*')
      .limit(1);

    if (shiftsError) {
      console.log('❌ Error consultando shifts:', shiftsError.message);
    } else {
      console.log('✅ Tabla shifts accesible');
      if (shiftsData && shiftsData.length > 0) {
        console.log('📊 Ejemplo de registro en shifts:', shiftsData[0]);
      } else {
        console.log('📝 Tabla shifts vacía (normal en primera ejecución)');
      }
    }
  } catch (err) {
    console.log('❌ Error verificando estructura shifts:', err.message);
  }

  console.log('\n🎯 Verificación completada');
}

// Ejecutar verificación
verifyTables().catch(console.error);
