// test-data.js - Script de verificación de datos
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbvhxqxpfxmhbxhvqgxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidmh4cXhwZnhtaGJ4aHZxZ3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNjQ0NzgsImV4cCI6MjA0NDg0MDQ3OH0.ygDWcQrNJWQrjCg_zNnCzxFRXKWHqGFqCPxjWgXfQhM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testData() {
  console.log('\n🔍 VERIFICACIÓN DE DATOS EN SUPABASE\n');
  console.log('=' .repeat(60));

  // 1. Verificar empleados
  console.log('\n1️⃣ EMPLEADOS:');
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id, nombre, apellidos, activo')
    .eq('activo', true);
  
  if (empError) {
    console.log('❌ Error:', empError.message);
  } else {
    console.log(`✅ Total empleados activos: ${employees.length}`);
    employees.slice(0, 3).forEach(emp => {
      console.log(`   - ${emp.nombre} ${emp.apellidos} (ID: ${emp.id})`);
    });
    if (employees.length > 3) console.log(`   ... y ${employees.length - 3} más`);
  }

  // 2. Verificar turnos
  console.log('\n2️⃣ TURNOS:');
  const { data: shifts, error: shiftError } = await supabase
    .from('shifts')
    .select('id, name, start_time, end_time, is_active')
    .eq('is_active', true);
  
  if (shiftError) {
    console.log('❌ Error:', shiftError.message);
  } else {
    console.log(`✅ Total turnos activos: ${shifts.length}`);
    shifts.forEach(shift => {
      console.log(`   - ${shift.name}: ${shift.start_time} - ${shift.end_time} (ID: ${shift.id})`);
    });
  }

  // 3. Verificar asignaciones de turnos
  console.log('\n3️⃣ ASIGNACIONES DE TURNOS:');
  const { data: assignments, error: assignError } = await supabase
    .from('employee_shifts')
    .select(`
      id,
      date,
      employee:employees(nombre, apellidos),
      shift:shifts(name, start_time, end_time)
    `)
    .order('date', { ascending: false })
    .limit(10);
  
  if (assignError) {
    console.log('❌ Error:', assignError.message);
  } else {
    console.log(`✅ Total asignaciones (últimas 10): ${assignments.length}`);
    assignments.forEach(assign => {
      console.log(`   - ${assign.date}: ${assign.employee?.nombre} ${assign.employee?.apellidos} → ${assign.shift?.name} (${assign.shift?.start_time}-${assign.shift?.end_time})`);
    });
  }

  // 4. Verificar centros
  console.log('\n4️⃣ CENTROS:');
  const { data: centers, error: centerError } = await supabase
    .from('centers')
    .select('id, name');
  
  if (centerError) {
    console.log('❌ Error:', centerError.message);
  } else {
    console.log(`✅ Total centros: ${centers.length}`);
    centers.forEach(center => {
      console.log(`   - ${center.name} (ID: ${center.id})`);
    });
  }

  // 5. Verificar festivos
  console.log('\n5️⃣ FESTIVOS (2025):');
  const { data: holidays, error: holidayError } = await supabase
    .from('holidays')
    .select('id, name, date, type')
    .gte('date', '2025-01-01')
    .lte('date', '2025-12-31')
    .order('date');
  
  if (holidayError) {
    console.log('❌ Error:', holidayError.message);
  } else {
    console.log(`✅ Total festivos 2025: ${holidays.length}`);
    holidays.slice(0, 5).forEach(holiday => {
      console.log(`   - ${holiday.date}: ${holiday.name} (${holiday.type})`);
    });
    if (holidays.length > 5) console.log(`   ... y ${holidays.length - 5} más`);
  }

  // 6. Estadísticas generales
  console.log('\n6️⃣ ESTADÍSTICAS:');
  
  // Contar asignaciones por mes actual
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: monthAssignments, error: monthError } = await supabase
    .from('employee_shifts')
    .select('id', { count: 'exact' })
    .gte('date', `${currentMonth}-01`)
    .lte('date', `${currentMonth}-31`);
  
  if (!monthError) {
    console.log(`✅ Asignaciones mes actual: ${monthAssignments?.length || 0}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Verificación completada\n');
}

testData().catch(console.error);
