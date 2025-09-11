import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer variables de entorno del archivo .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL?.replace(/"/g, '');
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY?.replace(/"/g, '');

async function cleanupShifts() {
  try {
    console.log('🧹 Limpiando turnos problemáticos...\n');
    
    // 1. Obtener todos los turnos
    const shiftsResponse = await fetch(`${SUPABASE_URL}/rest/v1/shifts?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const shifts = await shiftsResponse.json();
    console.log(`🕐 Turnos encontrados: ${shifts.length}`);
    
    // 2. Obtener todas las asignaciones
    const assignmentsResponse = await fetch(`${SUPABASE_URL}/rest/v1/employee_shifts?select=shift_id`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const assignments = await assignmentsResponse.json();
    const assignedShiftIds = new Set(assignments.map(a => a.shift_id));
    console.log(`📋 Asignaciones encontradas: ${assignments.length}`);
    console.log(`🔗 Turnos con asignaciones: ${assignedShiftIds.size}`);
    
    // 3. Identificar turnos sin asignaciones
    const unassignedShifts = shifts.filter(shift => !assignedShiftIds.has(shift.id));
    console.log(`\n❌ Turnos sin asignaciones: ${unassignedShifts.length}`);
    
    if (unassignedShifts.length === 0) {
      console.log('✅ No hay turnos sin asignaciones para limpiar');
      return;
    }
    
    // 4. Mostrar turnos que se van a eliminar
    console.log('\n📝 Turnos que se eliminarán:');
    unassignedShifts.forEach(shift => {
      console.log(`  - ${shift.name} (ID: ${shift.id}) - ${shift.start_time} a ${shift.end_time}`);
    });
    
    // 5. Confirmar eliminación
    console.log('\n⚠️  ATENCIÓN: Se eliminarán los turnos listados arriba');
    console.log('   Esto NO afectará a las asignaciones existentes');
    
    // Eliminar turnos sin asignaciones
    let deletedCount = 0;
    for (const shift of unassignedShifts) {
      try {
        const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/shifts?id=eq.${shift.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Eliminado: ${shift.name} (ID: ${shift.id})`);
          deletedCount++;
        } else {
          const error = await deleteResponse.text();
          console.log(`❌ Error eliminando ${shift.name}: ${error}`);
        }
      } catch (error) {
        console.log(`❌ Error eliminando ${shift.name}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Limpieza completada: ${deletedCount} turnos eliminados`);
    
    // 6. Verificar estado final
    const finalShiftsResponse = await fetch(`${SUPABASE_URL}/rest/v1/shifts?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const finalShifts = await finalShiftsResponse.json();
    console.log(`\n📊 Estado final: ${finalShifts.length} turnos restantes`);
    
    if (finalShifts.length > 0) {
      console.log('Turnos restantes:');
      finalShifts.forEach(shift => {
        const hasAssignments = assignedShiftIds.has(shift.id);
        console.log(`  - ${shift.name} ${hasAssignments ? '✅' : '❌'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
  }
}

cleanupShifts().then(() => {
  console.log('\n✅ Proceso de limpieza completado');
  process.exit(0);
}).catch(console.error);
