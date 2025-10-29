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

async function checkShiftsAndAssignments() {
  try {
    console.log('🔍 Verificando estado actual de turnos y asignaciones...');
    
    // 1. Verificar turnos
    const { data: shifts, error: shiftsError } = await supabase
      .from('shifts')
      .select('*')
      .order('id');
    
    if (shiftsError) throw shiftsError;
    console.log(`\n📋 TURNOS ENCONTRADOS: ${shifts?.length || 0}`);
    shifts?.forEach(shift => {
      console.log(`   ID: ${shift.id} | ${shift.name} | Centro: ${shift.center_id} | ${shift.start_time}-${shift.end_time}`);
      console.log(`   Días: L:${shift.monday} M:${shift.tuesday} X:${shift.wednesday} J:${shift.thursday} V:${shift.friday} S:${shift.saturday} D:${shift.sunday}`);
      console.log(`   Min/Max empleados: ${shift.min_employees}/${shift.max_employees}`);
      console.log('');
    });
    
    // 2. Verificar asignaciones
    const { data: assignments, error: assignError } = await supabase
      .from('employee_shifts')
      .select('*')
      .order('date');
    
    if (assignError) throw assignError;
    console.log(`👥 ASIGNACIONES ENCONTRADAS: ${assignments?.length || 0}`);
    assignments?.forEach(assignment => {
      console.log(`   ID: ${assignment.id} | Empleado: ${assignment.employee_id} | Turno: ${assignment.shift_id} | Fecha: ${assignment.date}`);
    });
    
    // 3. Verificar empleados
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, name, center_id, is_active')
      .limit(5);
    
    if (empError) throw empError;
    console.log(`\n👤 EMPLEADOS (primeros 5): ${employees?.length || 0}`);
    employees?.forEach(emp => {
      console.log(`   ID: ${emp.id} | ${emp.name} | Centro: ${emp.center_id} | Activo: ${emp.is_active}`);
    });
    
    // 4. Análisis de cobertura
    console.log('\n📊 ANÁLISIS DE COBERTURA:');
    if (shifts && assignments) {
      shifts.forEach(shift => {
        const shiftAssignments = assignments.filter(a => a.shift_id === shift.id);
        const coverage = shiftAssignments.length >= shift.min_employees ? '✅ CUBIERTO' : '❌ SIN CUBRIR';
        console.log(`   Turno "${shift.name}" (ID: ${shift.id}): ${shiftAssignments.length}/${shift.min_employees} empleados - ${coverage}`);
      });
    }
    
    // 5. Verificar fechas específicas
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`\n📅 ASIGNACIONES PARA HOY (${today}):`);
    const todayAssignments = assignments?.filter(a => a.date === today) || [];
    if (todayAssignments.length === 0) {
      console.log('   No hay asignaciones para hoy');
    } else {
      todayAssignments.forEach(a => console.log(`   Empleado ${a.employee_id} -> Turno ${a.shift_id}`));
    }
    
    console.log(`\n📅 ASIGNACIONES PARA MAÑANA (${tomorrowStr}):`);
    const tomorrowAssignments = assignments?.filter(a => a.date === tomorrowStr) || [];
    if (tomorrowAssignments.length === 0) {
      console.log('   No hay asignaciones para mañana');
    } else {
      tomorrowAssignments.forEach(a => console.log(`   Empleado ${a.employee_id} -> Turno ${a.shift_id}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkShiftsAndAssignments();
