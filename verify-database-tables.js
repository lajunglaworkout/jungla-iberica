// Script para verificar que las tablas de turnos y fichajes se crearon correctamente
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

async function diagnosticoCompleto() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DE TURNOS...\n');
    
    // 1. Verificar tabla shifts
    console.log('📋 TABLA SHIFTS:');
    const { data: shifts, error: shiftsError } = await supabase
      .from('shifts')
      .select('*');
    
    if (shiftsError) {
      console.log('❌ Error:', shiftsError.message);
    } else {
      console.log(`   Total registros: ${shifts?.length || 0}`);
      shifts?.forEach(shift => {
        console.log(`   ID: ${shift.id} | ${shift.name} | Centro: ${shift.center_id} | ${shift.start_time}-${shift.end_time}`);
      });
    }
    
    // 2. Verificar tabla employee_shifts
    console.log('\n👥 TABLA EMPLOYEE_SHIFTS:');
    const { data: employeeShifts, error: empShiftsError } = await supabase
      .from('employee_shifts')
      .select('*');
    
    if (empShiftsError) {
      console.log('❌ Error:', empShiftsError.message);
    } else {
      console.log(`   Total registros: ${employeeShifts?.length || 0}`);
      employeeShifts?.forEach(assign => {
        console.log(`   ID: ${assign.id} | Empleado: ${assign.employee_id} | Turno: ${assign.shift_id} | Fecha: ${assign.date}`);
      });
    }
    
    // 3. Verificar tabla daily_attendance
    console.log('\n📅 TABLA DAILY_ATTENDANCE:');
    const { data: attendance, error: attError } = await supabase
      .from('daily_attendance')
      .select('*')
      .gte('date', '2025-08-01');
    
    if (attError) {
      console.log('❌ Error o tabla no existe:', attError.message);
    } else {
      console.log(`   Total registros (desde agosto): ${attendance?.length || 0}`);
      attendance?.forEach(att => {
        console.log(`   Empleado: ${att.employee_id} | Fecha: ${att.date} | Estado: ${att.status}`);
      });
    }
    
    // 4. Buscar empleado Javier específicamente
    console.log('\n🔍 BUSCANDO EMPLEADO JAVIER:');
    const { data: javierEmp, error: javierError } = await supabase
      .from('employees')
      .select('*')
      .ilike('name', '%Javier%');
    
    if (javierError) {
      console.log('❌ Error:', javierError.message);
    } else {
      console.log(`   Empleados encontrados: ${javierEmp?.length || 0}`);
      javierEmp?.forEach(emp => {
        console.log(`   ID: ${emp.id} | Nombre: ${emp.name} | Centro: ${emp.center_id}`);
      });
      
      // Si encontramos a Javier, buscar sus asignaciones
      if (javierEmp && javierEmp.length > 0) {
        const javierId = javierEmp[0].id;
        console.log(`\n🔍 ASIGNACIONES DE JAVIER (ID: ${javierId}):`);
        
        const { data: javierAssigns } = await supabase
          .from('employee_shifts')
          .select('*')
          .eq('employee_id', javierId);
        
        console.log(`   Asignaciones encontradas: ${javierAssigns?.length || 0}`);
        javierAssigns?.forEach(assign => {
          console.log(`   Turno: ${assign.shift_id} | Fecha: ${assign.date}`);
        });
      }
    }
    
    // 5. Verificar otras tablas relacionadas
    console.log('\n🔍 VERIFICANDO OTRAS TABLAS:');
    
    // shift_changes
    const { data: changes, error: changesError } = await supabase
      .from('shift_changes')
      .select('*')
      .limit(5);
    
    if (changesError) {
      console.log('   shift_changes: No existe o sin acceso');
    } else {
      console.log(`   shift_changes: ${changes?.length || 0} registros`);
    }
    
    // shift_coverage
    const { data: coverage, error: coverageError } = await supabase
      .from('shift_coverage')
      .select('*')
      .limit(5);
    
    if (coverageError) {
      console.log('   shift_coverage: No existe o sin acceso');
    } else {
      console.log(`   shift_coverage: ${coverage?.length || 0} registros`);
    }
    
    console.log('\n✅ Diagnóstico completado');
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }

  console.log('\n🎯 Verificación completada');
}

diagnosticoCompleto();
