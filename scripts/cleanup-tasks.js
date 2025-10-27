/**
 * Script para limpiar tareas pendientes sin departamento asignado
 * Uso: node scripts/cleanup-tasks.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gfnjlmfziczimaohgkct.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupTasks() {
  try {
    console.log('🧹 Iniciando limpieza de tareas...\n');

    // Obtener todas las tareas pendientes
    const { data: allTasks, error: fetchError } = await supabase
      .from('tareas')
      .select('*')
      .eq('estado', 'pendiente');

    if (fetchError) {
      console.error('❌ Error al obtener tareas:', fetchError);
      process.exit(1);
    }

    console.log(`📊 Total de tareas pendientes: ${allTasks?.length || 0}`);

    // Tareas sin departamento
    const tasksWithoutDept = allTasks?.filter(t => !t.departamento || t.departamento === 'Sin asignar') || [];
    console.log(`📋 Tareas sin departamento: ${tasksWithoutDept.length}`);

    if (tasksWithoutDept.length === 0) {
      console.log('✅ No hay tareas para limpiar');
      process.exit(0);
    }

    // Mostrar tareas a eliminar
    console.log('\n📝 Tareas a eliminar:');
    tasksWithoutDept.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.titulo} (Asignado a: ${task.asignado_a})`);
    });

    // Eliminar tareas
    console.log('\n🗑️  Eliminando tareas...');
    const taskIds = tasksWithoutDept.map(t => t.id);
    
    const { error: deleteError } = await supabase
      .from('tareas')
      .delete()
      .in('id', taskIds);

    if (deleteError) {
      console.error('❌ Error al eliminar tareas:', deleteError);
      process.exit(1);
    }

    console.log(`✅ ${tasksWithoutDept.length} tareas eliminadas correctamente\n`);

    // Verificar resultado
    const { data: remainingTasks, error: verifyError } = await supabase
      .from('tareas')
      .select('*')
      .eq('estado', 'pendiente');

    if (verifyError) {
      console.error('❌ Error al verificar:', verifyError);
      process.exit(1);
    }

    console.log(`📊 Tareas pendientes restantes: ${remainingTasks?.length || 0}`);
    console.log('✅ Limpieza completada exitosamente');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  }
}

cleanupTasks();
