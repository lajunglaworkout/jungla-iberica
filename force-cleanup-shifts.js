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

async function forceCleanupShifts() {
  try {
    console.log('🔥 LIMPIEZA FORZADA DE TURNOS...');
    
    // 1. Verificar estado actual
    const { data: currentShifts } = await supabase
      .from('shifts')
      .select('*');
    
    const { data: currentAssignments } = await supabase
      .from('employee_shifts')
      .select('*');
    
    console.log(`📊 Estado ANTES de limpieza:`);
    console.log(`   Turnos: ${currentShifts?.length || 0}`);
    console.log(`   Asignaciones: ${currentAssignments?.length || 0}`);
    
    if (currentShifts?.length > 0) {
      console.log('📋 Turnos encontrados:');
      currentShifts.forEach(shift => {
        console.log(`   ID: ${shift.id} | ${shift.name} | Centro: ${shift.center_id}`);
      });
    }
    
    // 2. Eliminar asignaciones usando DELETE con condición siempre verdadera
    console.log('\n🗑️ Eliminando TODAS las asignaciones...');
    const { error: deleteAssignError } = await supabase
      .from('employee_shifts')
      .delete()
      .gte('id', 0); // Condición que siempre es verdadera
    
    if (deleteAssignError) {
      console.error('❌ Error eliminando asignaciones:', deleteAssignError);
    } else {
      console.log('✅ Asignaciones eliminadas');
    }
    
    // 3. Eliminar turnos usando DELETE con condición siempre verdadera
    console.log('\n🗑️ Eliminando TODOS los turnos...');
    const { error: deleteShiftError } = await supabase
      .from('shifts')
      .delete()
      .gte('id', 0); // Condición que siempre es verdadera
    
    if (deleteShiftError) {
      console.error('❌ Error eliminando turnos:', deleteShiftError);
    } else {
      console.log('✅ Turnos eliminados');
    }
    
    // 4. Verificar limpieza final
    console.log('\n🔍 Verificación FINAL...');
    
    const { data: finalShifts } = await supabase
      .from('shifts')
      .select('*');
    
    const { data: finalAssignments } = await supabase
      .from('employee_shifts')
      .select('*');
    
    console.log(`📊 Estado DESPUÉS de limpieza:`);
    console.log(`   Turnos: ${finalShifts?.length || 0}`);
    console.log(`   Asignaciones: ${finalAssignments?.length || 0}`);
    
    if ((finalShifts?.length || 0) === 0 && (finalAssignments?.length || 0) === 0) {
      console.log('\n🎉 ¡LIMPIEZA EXITOSA! Base de datos completamente limpia');
      console.log('🔄 Recarga la página del navegador para ver los cambios');
    } else {
      console.log('\n⚠️ Aún quedan registros. Puede ser un problema de permisos RLS');
      if (finalShifts?.length > 0) {
        console.log('Turnos restantes:', finalShifts.map(s => `${s.id}: ${s.name}`));
      }
    }
    
  } catch (error) {
    console.error('💥 Error en limpieza forzada:', error.message);
  }
}

forceCleanupShifts();
