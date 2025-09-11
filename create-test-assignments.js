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

async function createTestAssignments() {
  try {
    console.log('🔍 Verificando empleados y turnos disponibles...');
    
    // Obtener empleados
    const employeesResponse = await fetch(`${SUPABASE_URL}/rest/v1/empleados?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    let employees = [];
    if (employeesResponse.ok) {
      employees = await employeesResponse.json();
    } else {
      // Intentar con tabla employees
      const employeesResponse2 = await fetch(`${SUPABASE_URL}/rest/v1/employees?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      if (employeesResponse2.ok) {
        employees = await employeesResponse2.json();
      }
    }
    
    console.log(`👥 Empleados encontrados: ${employees.length}`);
    if (employees.length > 0) {
      employees.slice(0, 3).forEach(emp => {
        console.log(`  - ID: ${emp.id}, Nombre: ${emp.name || emp.nombre || emp.first_name || 'Sin nombre'}`);
      });
    }
    
    // Obtener turnos
    const shiftsResponse = await fetch(`${SUPABASE_URL}/rest/v1/shifts?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const shifts = shiftsResponse.ok ? await shiftsResponse.json() : [];
    console.log(`🕐 Turnos encontrados: ${shifts.length}`);
    if (shifts.length > 0) {
      shifts.slice(0, 3).forEach(shift => {
        console.log(`  - ID: ${shift.id}, Nombre: ${shift.name}, Min empleados: ${shift.min_employees}`);
      });
    }
    
    if (employees.length === 0 || shifts.length === 0) {
      console.log('⚠️ No hay suficientes empleados o turnos para crear asignaciones de prueba');
      return;
    }
    
    // Crear asignaciones de prueba para hoy y mañana
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const testAssignments = [
      {
        employee_id: employees[0].id,
        shift_id: shifts[0].id,
        date: today
      },
      {
        employee_id: employees[1] ? employees[1].id : employees[0].id,
        shift_id: shifts[0].id,
        date: today
      },
      {
        employee_id: employees[0].id,
        shift_id: shifts[1] ? shifts[1].id : shifts[0].id,
        date: tomorrow
      }
    ];
    
    console.log('📝 Creando asignaciones de prueba...');
    
    for (const assignment of testAssignments) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_shifts`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(assignment)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Asignación creada: Employee ${assignment.employee_id} → Shift ${assignment.shift_id} (${assignment.date})`);
      } else {
        const error = await response.text();
        console.log(`❌ Error creando asignación: ${error}`);
      }
    }
    
    console.log('\n🔄 Verificando asignaciones creadas...');
    
    const assignmentsResponse = await fetch(`${SUPABASE_URL}/rest/v1/employee_shifts?select=*,shifts(name)`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (assignmentsResponse.ok) {
      const assignments = await assignmentsResponse.json();
      console.log(`📋 Total asignaciones en BD: ${assignments.length}`);
      assignments.forEach(assignment => {
        console.log(`  - Employee ${assignment.employee_id} → ${assignment.shifts?.name || 'Turno'} (${assignment.date})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestAssignments().then(() => {
  console.log('\n✅ Proceso completado');
  process.exit(0);
}).catch(console.error);
