import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupAndCreateIncident() {
  try {
    // 1. Borrar todas las incidencias existentes
    console.log('🗑️ Borrando incidencias existentes...');
    const { error: deleteError } = await supabase
      .from('checklist_incidents')
      .delete()
      .neq('id', 0); // Borra todas las filas
    
    if (deleteError) {
      console.error('Error borrando incidencias:', deleteError);
      return;
    }
    
    console.log('✅ Incidencias borradas exitosamente');
    
    // 2. Crear una nueva incidencia de prueba
    console.log('📝 Creando nueva incidencia de prueba...');
    const { data, error: insertError } = await supabase
      .from('checklist_incidents')
      .insert([
        {
          title: 'Problema con equipamiento de gimnasio',
          description: 'Las mancuernas de 15kg están rotas y necesitan reparación urgente. Los usuarios no pueden completar sus rutinas.',
          priority: 'alta',
          department: 'Mantenimiento',
          center_name: 'Centro Sevilla',
          reporter_name: 'Francisco Giráldez',
          reporter_email: 'francisco@lajungla.com',
          status: 'pendiente',
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (insertError) {
      console.error('Error creando incidencia:', insertError);
      return;
    }
    
    console.log('✅ Nueva incidencia creada:', data);
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

cleanupAndCreateIncident();
