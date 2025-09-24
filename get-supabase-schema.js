import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (reemplaza con tus valores reales)
const SUPABASE_URL = 'https://jfxlzxmjcgmqvqaipyxr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGx6eG1qY2dtcXZxYWlweXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1NzU3MDMsImV4cCI6MjA0MjE1MTcwM30.Yz0zHaGEqCWJCJMhzLdWiNGmJgRzqHDhZJhBONJxQxg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getSupabaseSchema() {
  console.log('🔍 OBTENIENDO ESQUEMA COMPLETO DE SUPABASE...\n');
  
  try {
    // Obtener todas las tablas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      console.error('❌ Error obteniendo tablas:', tablesError);
      return;
    }

    console.log(`📊 TABLAS ENCONTRADAS (${tables.length}):`);
    console.log('=====================================');
    
    for (const table of tables) {
      console.log(`\n🗂️  TABLA: ${table.table_name.toUpperCase()}`);
      console.log('─'.repeat(50));
      
      // Obtener columnas de cada tabla
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .order('ordinal_position');

      if (columnsError) {
        console.error(`❌ Error obteniendo columnas de ${table.table_name}:`, columnsError);
        continue;
      }

      // Mostrar columnas
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  📝 ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
      });

      // Obtener algunos datos de ejemplo (máximo 3 registros)
      try {
        const { data: sampleData, error: sampleError } = await supabase
          .from(table.table_name)
          .select('*')
          .limit(3);

        if (!sampleError && sampleData && sampleData.length > 0) {
          console.log(`\n  📋 DATOS DE EJEMPLO (${sampleData.length} registros):`);
          console.log('  ' + '─'.repeat(45));
          sampleData.forEach((row, index) => {
            console.log(`  ${index + 1}. ${JSON.stringify(row, null, 2).substring(0, 200)}...`);
          });
        } else {
          console.log('  📭 Sin datos de ejemplo');
        }
      } catch (sampleError) {
        console.log('  ⚠️  No se pudieron obtener datos de ejemplo');
      }
    }

    console.log('\n🎯 RESUMEN:');
    console.log('=====================================');
    console.log(`📊 Total de tablas: ${tables.length}`);
    
    // Mostrar tablas relacionadas con logística
    const logisticsTables = tables.filter(t => 
      t.table_name.includes('inventory') ||
      t.table_name.includes('supplier') ||
      t.table_name.includes('order') ||
      t.table_name.includes('product')
    );
    
    if (logisticsTables.length > 0) {
      console.log(`📦 Tablas de logística encontradas: ${logisticsTables.map(t => t.table_name).join(', ')}`);
    } else {
      console.log('📦 No se encontraron tablas específicas de logística');
    }

    // Mostrar tablas relacionadas con empleados/RRHH
    const hrTables = tables.filter(t => 
      t.table_name.includes('empleado') ||
      t.table_name.includes('employee') ||
      t.table_name.includes('shift') ||
      t.table_name.includes('centro')
    );
    
    if (hrTables.length > 0) {
      console.log(`👥 Tablas de RRHH encontradas: ${hrTables.map(t => t.table_name).join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
getSupabaseSchema();
