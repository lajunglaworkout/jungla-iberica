import { supabase } from '../lib/supabase';

/**
 * Servicio para gestionar tareas
 */

// Marcar tarea como completada
export const completeTask = async (
  taskId: string | number,
  completedBy: string,
  completionNotes: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Marcando tarea como completada:', { taskId, completedBy });
    
    const { error } = await supabase
      .from('tareas')
      .update({
        estado: 'completada'
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error marcando tarea como completada:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Tarea marcada como completada');
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al marcar tarea como completada' };
  }
};

// Obtener tareas por usuario
export const getTasksByUser = async (userEmail: string, estado?: string): Promise<{ success: boolean; tasks?: any[]; error?: string }> => {
  try {
    let query = supabase
      .from('tareas')
      .select('*')
      .eq('asignado_a', userEmail)
      .order('fecha_limite', { ascending: true });

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error cargando tareas del usuario:', error);
      return { success: false, error: error.message };
    }

    return { success: true, tasks: data || [] };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al cargar tareas' };
  }
};

// Obtener todas las tareas pendientes
export const getPendingTasks = async (): Promise<{ success: boolean; tasks?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .eq('estado', 'pendiente')
      .order('fecha_limite', { ascending: true });

    if (error) {
      console.error('Error cargando tareas pendientes:', error);
      return { success: false, error: error.message };
    }

    return { success: true, tasks: data || [] };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al cargar tareas pendientes' };
  }
};

// Obtener tareas completadas
export const getCompletedTasks = async (): Promise<{ success: boolean; tasks?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .eq('estado', 'completada')
      .order('fecha_limite', { ascending: false });

    if (error) {
      console.error('Error cargando tareas completadas:', error);
      return { success: false, error: error.message };
    }

    return { success: true, tasks: data || [] };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al cargar tareas completadas' };
  }
};

// Filtrar tareas por criterios
export const filterTasks = async (filters: {
  estado?: string;
  prioridad?: string;
  asignado_a?: string;
  reunion_titulo?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}): Promise<{ success: boolean; tasks?: any[]; error?: string }> => {
  try {
    let query = supabase.from('tareas').select('*');

    if (filters.estado) {
      query = query.eq('estado', filters.estado);
    }
    if (filters.prioridad) {
      query = query.eq('prioridad', filters.prioridad);
    }
    if (filters.asignado_a) {
      query = query.eq('asignado_a', filters.asignado_a);
    }
    if (filters.reunion_titulo) {
      query = query.ilike('reunion_titulo', `%${filters.reunion_titulo}%`);
    }
    if (filters.fecha_desde) {
      query = query.gte('fecha_limite', filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      query = query.lte('fecha_limite', filters.fecha_hasta);
    }

    const { data, error } = await query.order('fecha_limite', { ascending: true });

    if (error) {
      console.error('Error filtrando tareas:', error);
      return { success: false, error: error.message };
    }

    console.log(`🔍 Tareas filtradas: ${data?.length || 0} resultados`);
    return { success: true, tasks: data || [] };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al filtrar tareas' };
  }
};

// Obtener estadísticas de tareas
export const getTaskStats = async (): Promise<{ success: boolean; stats?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('estado, prioridad');

    if (error) {
      console.error('Error cargando estadísticas:', error);
      return { success: false, error: error.message };
    }

    const stats = {
      total: data?.length || 0,
      pendientes: data?.filter((t: any) => t.estado === 'pendiente').length || 0,
      completadas: data?.filter((t: any) => t.estado === 'completada').length || 0,
      criticas: data?.filter((t: any) => t.prioridad === 'critica').length || 0,
      altas: data?.filter((t: any) => t.prioridad === 'alta').length || 0
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al obtener estadísticas' };
  }
};
