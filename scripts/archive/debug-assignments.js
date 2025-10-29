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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

async function debugAssignments() {
  try {
    console.log('🔍 Investigando asignaciones y duplicados...');
    
    // Hacer petición HTTP directa a Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/employee_shifts?select=*,shifts(name,start_time,end_time,min_employees,max_employees)`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const assignments = await response.json();
    
    console.log(`📋 Total asignaciones en BD: ${assignments.length}`);
    
    // Buscar duplicados
    const duplicates = [];
    const seen = new Set();
    
    assignments.forEach(assignment => {
      const key = `${assignment.employee_id}-${assignment.shift_id}-${assignment.date}`;
      if (seen.has(key)) {
        duplicates.push(assignment);
      } else {
        seen.add(key);
      }
    });
    
    if (duplicates.length > 0) {
      console.log(`⚠️ Duplicados encontrados: ${duplicates.length}`);
      duplicates.forEach(dup => {
        console.log(`  - ID: ${dup.id}, Employee: ${dup.employee_id}, Shift: ${dup.shift_id}, Date: ${dup.date}`);
      });
    } else {
      console.log('✅ No se encontraron duplicados');
    }
    
    // Analizar asignaciones por fecha
    const assignmentsByDate = {};
    assignments.forEach(assignment => {
      if (!assignmentsByDate[assignment.date]) {
        assignmentsByDate[assignment.date] = [];
      }
      assignmentsByDate[assignment.date].push(assignment);
    });
    
    console.log('\n📅 Asignaciones por fecha:');
    Object.keys(assignmentsByDate).sort().forEach(date => {
      const dateAssignments = assignmentsByDate[date];
      console.log(`  ${date}: ${dateAssignments.length} asignaciones`);
      
      // Agrupar por turno
      const byShift = {};
      dateAssignments.forEach(assignment => {
        if (!byShift[assignment.shift_id]) {
          byShift[assignment.shift_id] = [];
        }
        byShift[assignment.shift_id].push(assignment);
      });
      
      Object.keys(byShift).forEach(shiftId => {
        const shiftAssignments = byShift[shiftId];
        const shiftName = shiftAssignments[0].shifts?.name || 'Sin nombre';
        const minEmployees = shiftAssignments[0].shifts?.min_employees || 1;
        const isCovered = shiftAssignments.length >= minEmployees;
        
        console.log(`    - ${shiftName} (ID: ${shiftId}): ${shiftAssignments.length}/${minEmployees} empleados ${isCovered ? '✅' : '❌'}`);
        
        if (!isCovered) {
          console.log(`      ⚠️ Turno descubierto - empleados asignados:`, shiftAssignments.map(a => a.employee_id));
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAssignments().then(() => {
  console.log('\n🔍 Investigación completada');
  process.exit(0);
}).catch(console.error);
