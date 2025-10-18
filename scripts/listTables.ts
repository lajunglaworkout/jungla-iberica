// scripts/listTables.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfnjlmfziczimaohgkct.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbmpsbWZ6aWN6aW1hb2hna2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDEzNzQ2OCwiZXhwIjoyMDY5NzEzNDY4fQ._UBAs1jxVzWcgYkYExS2iYPStl9KdQT1oBQby4ThtDQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllTables() {
  console.log('🔍 Listando todas las tablas en Supabase...\n');

  try {
    // Consultar el esquema de información de PostgreSQL
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          table_name,
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    });

    if (error) {
      console.log('⚠️ No se pudo usar RPC, intentando método alternativo...\n');
      
      // Método alternativo: intentar consultar tablas conocidas
      const knownTables = [
        'employees', 'empleados', 'centros', 'centers',
        'daily_checklists', 'checklist_incidents', 'objetivos',
        'reuniones', 'tareas', 'notificaciones',
        'inventory_items', 'suppliers', 'supplier_orders',
        'product_categories', 'inventory_movements', 'stock_alerts'
      ];

      console.log('📋 Verificando tablas conocidas:\n');
      
      for (const tableName of knownTables) {
        try {
          const { data: tableData, error: tableError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          if (!tableError) {
            const count = tableData?.length || 0;
            console.log(`✅ ${tableName.padEnd(30)} - Existe`);
          }
        } catch (e) {
          // Tabla no existe
        }
      }
    } else {
      console.log('📊 Tablas encontradas:\n');
      data.forEach((table: any) => {
        console.log(`✅ ${table.table_name.padEnd(30)} (${table.column_count} columnas)`);
      });
    }

    console.log('\n✅ Listado completado');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listAllTables();
