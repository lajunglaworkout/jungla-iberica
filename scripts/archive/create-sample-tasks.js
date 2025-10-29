// Script para crear tareas de prueba en Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfnjlmfziczimaohgkct.supabase.co';
const supabaseKey = 'sb_publishable_jZnZS-HRxXz_aOzcYY0mMA_Fl9xIwYZ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleTasks() {
  console.log('🚀 Creando tareas de prueba...');
  
  const sampleTasks = [
    {
      titulo: 'Revisar inventario de uniformes',
      descripcion: 'Verificar stock actual de uniformes en todos los centros',
      asignado_a: 'carlossuarezparra',
      prioridad: 'alta',
      estado: 'pendiente',
      fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      creado_por: 'carlossuarezparra@gmail.com',
    },
    {
      titulo: 'Preparar contenido para redes sociales',
      descripcion: 'Crear 5 posts para la próxima semana',
      asignado_a: 'carlossuarezparra',
      prioridad: 'media',
      estado: 'en_progreso',
      fecha_limite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      creado_por: 'carlossuarezparra@gmail.com',
    },
    {
      titulo: 'Revisar presupuestos pendientes',
      descripcion: 'Analizar y aprobar presupuestos de proveedores',
      asignado_a: 'carlossuarezparra',
      prioridad: 'critica',
      estado: 'pendiente',
      fecha_limite: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      creado_por: 'carlossuarezparra@gmail.com',
    },
    {
      titulo: 'Organizar evento de inauguración',
      descripcion: 'Coordinar todos los aspectos del evento de inauguración del nuevo centro',
      asignado_a: 'carlossuarezparra',
      prioridad: 'alta',
      estado: 'en_progreso',
      fecha_limite: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      creado_por: 'carlossuarezparra@gmail.com',
    }
  ];

  try {
    const { data, error } = await supabase
      .from('tareas')
      .insert(sampleTasks);

    if (error) {
      console.error('❌ Error creando tareas:', error);
    } else {
      console.log('✅ Tareas de prueba creadas exitosamente');
      console.log(`📋 Se crearon ${sampleTasks.length} tareas`);
    }
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

createSampleTasks();
