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

async function deleteUnassignedShifts() {
  try {
    console.log('🔍 Buscando turnos sin asignaciones...');
    
    // 1. Obtener todos los turnos
    const { data: shifts, error: shiftsError } = await supabase
      .from('shifts')
      .select('id, name, center_id');
    
    if (shiftsError) throw shiftsError;
    console.log(`📋 Total turnos encontrados: ${shifts?.length || 0}`);
    
    // 2. Obtener todas las asignaciones
    const { data: assignments, error: assignError } = await supabase
      .from('employee_shifts')
      .select('shift_id');
    
    if (assignError) throw assignError;
    console.log(`👥 Total asignaciones encontradas: ${assignments?.length || 0}`);
    
    // 3. Encontrar turnos sin asignaciones
    const assignedShiftIds = new Set(assignments?.map(a => a.shift_id) || []);
    const unassignedShifts = shifts?.filter(shift => !assignedShiftIds.has(shift.id)) || [];
    
    console.log(`🔴 Turnos sin asignaciones: ${unassignedShifts.length}`);
    
    if (unassignedShifts.length === 0) {
      console.log('✅ No hay turnos sin asignaciones para eliminar');
      return;
    }
    
    // 4. Mostrar turnos que se van a eliminar
    console.log('\n📝 Turnos que se eliminarán:');
    unassignedShifts.forEach(shift => {
      console.log(`   - ID: ${shift.id}, Nombre: ${shift.name}, Centro: ${shift.center_id}`);
    });
    
    // 5. Eliminar turnos sin asignaciones
    const shiftIdsToDelete = unassignedShifts.map(s => s.id);
    
    const { error: deleteError } = await supabase
      .from('shifts')
      .delete()
      .in('id', shiftIdsToDelete);
    
    if (deleteError) throw deleteError;
    
    console.log(`\n✅ ${unassignedShifts.length} turnos sin asignaciones eliminados correctamente`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deleteUnassignedShifts();
