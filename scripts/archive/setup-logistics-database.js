// setup-logistics-database.js
// Script para ejecutar el esquema de logística en Supabase

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesitamos service role para DDL

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  console.log('Necesitas:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupLogisticsDatabase() {
  try {
    console.log('🚀 Iniciando configuración de base de datos de logística...');

    // Leer el archivo SQL
    const sqlPath = path.join(process.cwd(), 'database-logistics.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ No se encontró el archivo database-logistics.sql');
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Archivo SQL leído correctamente');
    console.log(`📊 Tamaño: ${sqlContent.length} caracteres`);

    // Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`🔧 Ejecutando ${statements.length} statements SQL...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim().length === 0) continue;

      try {
        console.log(`⚡ Ejecutando statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });

        if (error) {
          console.error(`❌ Error en statement ${i + 1}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} ejecutado correctamente`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error ejecutando statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 RESUMEN DE EJECUCIÓN:');
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📝 Total: ${statements.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 ¡Base de datos de logística configurada exitosamente!');
      
      // Verificar que las tablas se crearon
      await verifyTables();
      
    } else {
      console.log('\n⚠️ Se completó con algunos errores. Revisa los logs arriba.');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

async function verifyTables() {
  console.log('\n🔍 Verificando tablas creadas...');
  
  const expectedTables = [
    'product_categories',
    'suppliers', 
    'inventory_items',
    'supplier_orders',
    'supplier_order_items',
    'inventory_movements',
    'stock_alerts'
  ];

  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Tabla ${table}: ${error.message}`);
      } else {
        console.log(`✅ Tabla ${table}: OK`);
      }
    } catch (err) {
      console.log(`❌ Tabla ${table}: ${err.message}`);
    }
  }
}

// Función alternativa usando SQL directo (si rpc no funciona)
async function setupWithDirectSQL() {
  console.log('\n🔄 Intentando método alternativo con SQL directo...');
  
  try {
    const sqlPath = path.join(process.cwd(), 'database-logistics.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar todo el SQL de una vez
    const { error } = await supabase.rpc('exec_sql', { 
      sql_query: sqlContent 
    });

    if (error) {
      console.error('❌ Error ejecutando SQL completo:', error);
      return false;
    }

    console.log('✅ SQL ejecutado correctamente');
    return true;
  } catch (err) {
    console.error('❌ Error en método alternativo:', err);
    return false;
  }
}

// Ejecutar el setup
console.log('🎯 CONFIGURACIÓN DE BASE DE DATOS DE LOGÍSTICA');
console.log('===============================================');

setupLogisticsDatabase()
  .then(() => {
    console.log('\n✨ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
