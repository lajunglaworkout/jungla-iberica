// Script para verificar que todas las correcciones del dashboard están funcionando
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (usar variables de entorno en producción)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDashboardFixes() {
  console.log('🔍 Verificando correcciones del dashboard...\n');

  // 1. Verificar que la tabla meetings existe
  console.log('1️⃣ Verificando tabla meetings...');
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.log('❌ Error: Tabla meetings no existe o no es accesible');
      console.log('   Solución: Ejecutar create-meetings-table.sql en Supabase');
    } else {
      console.log('✅ Tabla meetings existe y es accesible');
    }
  } catch (err) {
    console.log('❌ Error conectando a Supabase:', err.message);
  }

  // 2. Verificar que la consulta de incidents funciona
  console.log('\n2️⃣ Verificando consulta de incidents...');
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        incident_types(name, description),
        employees!incidents_employee_id_fkey(name, email)
      `)
      .limit(1);
    
    if (error) {
      console.log('❌ Error en consulta incidents:', error.message);
      console.log('   Solución: Verificar foreign keys en tabla incidents');
    } else {
      console.log('✅ Consulta de incidents funciona correctamente');
    }
  } catch (err) {
    console.log('❌ Error en consulta incidents:', err.message);
  }

  // 3. Verificar que los empleados se cargan correctamente
  console.log('\n3️⃣ Verificando carga de empleados...');
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('id, nombre, apellidos, email, activo')
      .eq('activo', true)
      .limit(5);
    
    if (error) {
      console.log('❌ Error cargando empleados:', error.message);
    } else {
      console.log(`✅ Empleados cargados correctamente (${data.length} encontrados)`);
      if (data.length > 0) {
        console.log(`   Ejemplo: ${data[0].nombre} ${data[0].apellidos} (${data[0].email})`);
      }
    }
  } catch (err) {
    console.log('❌ Error cargando empleados:', err.message);
  }

  // 4. Verificar estructura de centros
  console.log('\n4️⃣ Verificando centros...');
  try {
    const { data, error } = await supabase
      .from('centros')
      .select('id, name, city, status')
      .limit(5);
    
    if (error) {
      console.log('❌ Error cargando centros:', error.message);
    } else {
      console.log(`✅ Centros cargados correctamente (${data.length} encontrados)`);
      data.forEach(centro => {
        console.log(`   - ${centro.name} (${centro.city}) - ${centro.status}`);
      });
    }
  } catch (err) {
    console.log('❌ Error cargando centros:', err.message);
  }

  console.log('\n🎯 Verificación completada!');
  console.log('\n📋 Resumen de acciones necesarias:');
  console.log('   1. Ejecutar create-meetings-table.sql en Supabase');
  console.log('   2. Verificar que todas las foreign keys están correctas');
  console.log('   3. Comprobar que el dashboard se ve con estilos modernos');
  console.log('   4. Probar navegación entre módulos');
}

// Ejecutar verificación
verifyDashboardFixes().catch(console.error);
