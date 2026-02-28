import { supabase } from '../lib/supabase';
import { deleteTaskNotifications } from './notificationService';

/**
 * Servicio para gestionar tareas
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Tarea {
  id: string | number;
  estado: string;
  prioridad: string;
  asignado_a?: string;
  reunion_titulo?: string;
  reunion_origen?: number;
  fecha_limite?: string;
  fecha_completada?: string;
  completada_por?: string;
  notas_cierre?: string;
  attachments?: Record<string, unknown>[];
  links?: string[];
}

export interface TaskStats {
  total: number;
  pendientes: number;
  completadas: number;
  criticas: number;
  altas: number;
}

export type TaskAttachment = Record<string, unknown>;

// ─── Funciones ────────────────────────────────────────────────────────────────

// Marcar tarea como completada
export const completeTask = async (
  taskId: string | number,
  completedBy: string,
  completionNotes: string,
  attachments: TaskAttachment[] = [],
  links: string[] = []
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Marcando tarea como completada:', { taskId, completedBy, completionNotes, attachments, links });

    const { error } = await supabase
      .from('tareas')
      .update({
        estado: 'completada',
        completada_por: completedBy,
        notas_cierre: completionNotes,
        fecha_completada: new Date().toISOString(),
        attachments: attachments,
        links: links
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error marcando tarea como completada:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Tarea marcada como completada con datos:', {
      estado: 'completada',
      completada_por: completedBy,
      fecha_completada: new Date().toISOString(),
      attachments_count: attachments.length,
      links_count: links.length
    });

    // Eliminar notificaciones de esta tarea
    await deleteTaskNotifications(taskId);

    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al marcar tarea como completada' };
  }
};

// Obtener tareas por usuario
export const getTasksByUser = async (userEmail: string, estado?: string): Promise<{ success: boolean; tasks?: Tarea[]; error?: string }> => {
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
export const getPendingTasks = async (): Promise<{ success: boolean; tasks?: Tarea[]; error?: string }> => {
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
export const getCompletedTasks = async (): Promise<{ success: boolean; tasks?: Tarea[]; error?: string }> => {
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
}): Promise<{ success: boolean; tasks?: Tarea[]; error?: string }> => {
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
export const getTaskStats = async (): Promise<{ success: boolean; stats?: TaskStats; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('estado, prioridad');

    if (error) {
      console.error('Error cargando estadísticas:', error);
      return { success: false, error: error.message };
    }

    type TareaRow = { estado: string; prioridad: string };
    const rows = (data ?? []) as TareaRow[];
    const stats: TaskStats = {
      total: rows.length,
      pendientes: rows.filter(t => t.estado === 'pendiente').length,
      completadas: rows.filter(t => t.estado === 'completada').length,
      criticas: rows.filter(t => t.prioridad === 'critica').length,
      altas: rows.filter(t => t.prioridad === 'alta').length,
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al obtener estadísticas' };
  }
};

// Eliminar tareas por ID de reunión
export const deleteTasksByMeetingId = async (meetingId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`🗑️ Eliminando tareas de la reunión ${meetingId}...`);

    const { error } = await supabase
      .from('tareas')
      .delete()
      .eq('reunion_origen', meetingId);

    if (error) {
      console.error('Error eliminando tareas de la reunión:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Tareas de la reunión eliminadas correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al eliminar tareas de la reunión' };
  }
};

export const getTaskStatsByDepartments = async (deptIds: string[]): Promise<Record<string, { pending: number; completed: number }>> => {
  try {
    const { data, error } = await supabase.from('tareas').select('departamento, estado').in('departamento', deptIds).in('estado', ['pendiente', 'completada']);
    if (error || !data) return {};
    const stats: Record<string, { pending: number; completed: number }> = {};
    for (const id of deptIds) stats[id] = { pending: 0, completed: 0 };
    for (const t of data) {
      if (t.departamento && stats[t.departamento]) {
        if (t.estado === 'pendiente') stats[t.departamento].pending++;
        else if (t.estado === 'completada') stats[t.departamento].completed++;
      }
    }
    return stats;
  } catch { return {}; }
};

export const insertTasks = async (tasks: Record<string, unknown>[]): Promise<{ success: boolean; data?: Record<string, unknown>[]; error?: string }> => {
  try {
    const { data, error } = await supabase.from('tareas').insert(tasks).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Record<string, unknown>[] };
  } catch (error) {
    return { success: false, error: 'Error al insertar tareas' };
  }
};

export const getAllActiveTasks = async (): Promise<Tarea[]> => {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .in('estado', ['pendiente', 'en_progreso'])
      .order('fecha_limite', { ascending: true });
    if (error) return [];
    return (data ?? []) as Tarea[];
  } catch { return []; }
};

export const getTasksForUser = async (email: string, name: string): Promise<Tarea[]> => {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .or(`asignado_a.eq.${email},asignado_a.eq.${name}`)
      .in('estado', ['pendiente', 'en_progreso'])
      .order('fecha_limite', { ascending: true });
    if (error) return [];
    return (data ?? []) as Tarea[];
  } catch { return []; }
};

export const updateTaskStatus = async (id: number, newStatus: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('tareas').update({ estado: newStatus }).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error actualizando tarea' }; }
};

export const deleteTask = async (id: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('tareas').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error eliminando tarea' }; }
};

export const deleteTasksByIds = async (ids: number[]): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('tareas').delete().in('id', ids);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error eliminando tareas' }; }
};

export const getDirectionPendingTasks = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .in('estado', ['pendiente', 'en_progreso'])
      .eq('departamento_responsable', 'direccion')
      .order('fecha_limite', { ascending: true });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const markDirectionTaskCompleted = async (
  id: string,
  completadoEn: string,
  motivoCompletado: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('tareas')
      .update({ estado: 'completada', completado_en: completadoEn, motivo_completado: motivoCompletado })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error completando tarea' }; }
};

export const markDirectionTaskDelayed = async (
  id: string,
  fechaLimite: string,
  motivoRetraso: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('tareas')
      .update({ fecha_limite: fechaLimite, motivo_retraso: motivoRetraso, actualizado_en: new Date().toISOString() })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error posponiendo tarea' }; }
};

export const createDirectionTask = async (
  taskData: Record<string, unknown>
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> => {
  try {
    const { data, error } = await supabase.from('tareas').insert([taskData]).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Record<string, unknown> };
  } catch { return { success: false, error: 'Error creando tarea' }; }
};

export const getPendingTasksByDepartment = async (departmentId: string): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .eq('estado', 'pendiente')
      .eq('departamento', departmentId)
      .order('fecha_limite', { ascending: true });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};
