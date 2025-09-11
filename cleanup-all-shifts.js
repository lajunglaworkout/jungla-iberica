import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Leer variables de entorno
const envContent = readFileSync('.env', 'utf8');
const envLines = envContent.split('\n');

let supabaseUrl = '';
let supabaseKey = '';

envLines.forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].replace(/"/g, '').trim();
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].replace(/"/g, '').trim();
  }
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupAllShifts() {
  try {
    console.log('🧹 Limpiando base de datos...');
    
    // 1. Eliminar todas las asignaciones primero
    console.log('🗑️ Eliminando todas las asignaciones...');
    const { error: assignError } = await supabase
      .from('employee_shifts')
      .delete()
      .neq('id', 0); // Eliminar todos los registros
    
    if (assignError) throw assignError;
    console.log('✅ Asignaciones eliminadas');
    
    // 2. Eliminar todos los turnos
    console.log('🗑️ Eliminando todos los turnos...');
    const { error: shiftError } = await supabase
      .from('shifts')
      .delete()
      .neq('id', 0); // Eliminar todos los registros
    
    if (shiftError) throw shiftError;
    console.log('✅ Turnos eliminados');
    
    // 3. Verificar limpieza
    const { data: remainingShifts } = await supabase
      .from('shifts')
      .select('*');
    
    const { data: remainingAssignments } = await supabase
      .from('employee_shifts')
      .select('*');
    
    console.log(`\n📊 Estado final:`);
    console.log(`   Turnos restantes: ${remainingShifts?.length || 0}`);
    console.log(`   Asignaciones restantes: ${remainingAssignments?.length || 0}`);
    
    if ((remainingShifts?.length || 0) === 0 && (remainingAssignments?.length || 0) === 0) {
      console.log('\n✅ Base de datos limpia correctamente');
      console.log('🎯 Ahora puedes crear turnos reales desde la interfaz');
    } else {
      console.log('\n⚠️ Algunos registros no se pudieron eliminar');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanupAllShifts();
