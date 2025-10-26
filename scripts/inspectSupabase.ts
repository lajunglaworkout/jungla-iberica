/**
 * Script para inspeccionar la estructura de Supabase
 * Ejecutar con: npx ts-node scripts/inspectSupabase.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectDatabase() {
  console.log('🔍 Inspeccionando base de datos Supabase...\n');

  try {
    // Obtener todas las tablas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('❌ Error obteniendo tablas:', tablesError);
      return;
    }

    console.log('📊 TABLAS ENCONTRADAS:\n');
    
    if (tables && tables.length > 0) {
      for (const table of tables) {
        const tableName = (table as any).table_name;
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📋 Tabla: ${tableName}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

        // Obtener columnas
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_schema', 'public')
          .eq('table_name', tableName);

        if (columnsError) {
          console.error(`  ❌ Error obteniendo columnas: ${columnsError.message}`);
          continue;
        }

        if (columns && columns.length > 0) {
          console.log('\n  Columnas:');
          for (const col of columns) {
            const colName = (col as any).column_name;
            const dataType = (col as any).data_type;
            const nullable = (col as any).is_nullable === 'YES' ? '(nullable)' : '(required)';
            console.log(`    • ${colName}: ${dataType} ${nullable}`);
          }
        }

        // Obtener cantidad de registros
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!countError) {
          console.log(`\n  📊 Registros: ${count || 0}`);
        }
      }
    } else {
      console.log('❌ No se encontraron tablas');
    }

    console.log('\n\n✅ Inspección completada\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
inspectDatabase();
