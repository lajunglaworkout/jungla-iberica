/**
 * Servicio para guardar y consultar analytics de reuniones
 */

import { supabase } from '../lib/supabase';

interface MeetingMetrics {
  meeting_id: string;
  departamento: string;
  tipo_reunion: 'FISICA' | 'VIDEOLLAMADA';
  tareas_recurrentes_total: number;
  tareas_recurrentes_completadas: number;
  porcentaje_cumplimiento: number;
  tareas_anteriores_total: number;
  tareas_anteriores_completadas: number;
  tareas_anteriores_pendientes: number;
}

interface MeetingObjective {
  meeting_id: string;
  departamento: string;
  nombre: string;
  valor_objetivo: string | number;
  tipo_objetivo: 'numero' | 'texto' | 'porcentaje';
  unidad?: string;
  valor_anterior?: string | number;
  cumplido?: boolean;
}

interface MeetingBottleneck {
  meeting_id: string;
  departamento: string;
  tarea_titulo: string;
  tarea_id?: number;
  motivo: string;
  asignado_a?: string;
  fecha_limite?: string;
  categoria?: string;
}

/**
 * Guardar métricas de una reunión
 */
export const saveMeetingMetrics = async (
  metrics: MeetingMetrics
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📊 Guardando métricas de reunión:', metrics);

    const { error } = await supabase
      .from('meeting_metrics')
      .insert(metrics);

    if (error) {
      console.error('Error guardando métricas:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Métricas guardadas correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al guardar métricas' };
  }
};

/**
 * Guardar objetivos de una reunión
 */
export const saveMeetingObjectives = async (
  objectives: MeetingObjective[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🎯 Guardando objetivos de reunión:', objectives);

    if (objectives.length === 0) {
      console.log('ℹ️ No hay objetivos para guardar');
      return { success: true };
    }

    const { error } = await supabase
      .from('meeting_objectives')
      .insert(objectives);

    if (error) {
      console.error('Error guardando objetivos:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Objetivos guardados correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al guardar objetivos' };
  }
};

/**
 * Guardar cuellos de botella de una reunión
 */
export const saveMeetingBottlenecks = async (
  bottlenecks: MeetingBottleneck[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('⚠️ Guardando cuellos de botella:', bottlenecks);

    if (bottlenecks.length === 0) {
      console.log('ℹ️ No hay cuellos de botella para guardar');
      return { success: true };
    }

    const { error } = await supabase
      .from('meeting_bottlenecks')
      .insert(bottlenecks);

    if (error) {
      console.error('Error guardando cuellos de botella:', error);
      return { success: false, error: error.message };
    }

    // Ejecutar función para marcar recurrentes
    await supabase.rpc('mark_recurring_bottlenecks');

    console.log('✅ Cuellos de botella guardados correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al guardar cuellos de botella' };
  }
};

/**
 * Obtener objetivos de la reunión anterior del mismo departamento
 */
export const getPreviousMeetingObjectives = async (
  departamento: string
): Promise<{ success: boolean; objectives?: MeetingObjective[]; error?: string }> => {
  try {
    console.log('🔍 Buscando objetivos de reunión anterior:', departamento);

    // Buscar la última reunión del departamento
    const { data: lastMeeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('department', departamento)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (meetingError || !lastMeeting) {
      console.log('ℹ️ No hay reunión anterior');
      return { success: true, objectives: [] };
    }

    // Buscar objetivos de esa reunión
    const { data, error } = await supabase
      .from('meeting_objectives')
      .select('*')
      .eq('meeting_id', lastMeeting.id);

    if (error) {
      console.error('Error buscando objetivos anteriores:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Objetivos anteriores encontrados:', data?.length || 0);
    return { success: true, objectives: data || [] };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al buscar objetivos anteriores' };
  }
};

/**
 * Obtener rendimiento de un departamento
 */
export const getDepartmentPerformance = async (
  departamento: string
): Promise<{ success: boolean; performance?: any; error?: string }> => {
  try {
    console.log('📈 Obteniendo rendimiento de departamento:', departamento);

    const { data, error } = await supabase
      .from('department_performance')
      .select('*')
      .eq('departamento', departamento)
      .single();

    if (error) {
      console.error('Error obteniendo rendimiento:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Rendimiento obtenido:', data);
    return { success: true, performance: data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al obtener rendimiento' };
  }
};

/**
 * Obtener todos los cuellos de botella recurrentes
 */
export const getRecurringBottlenecks = async (
  departamento?: string
): Promise<{ success: boolean; bottlenecks?: any[]; error?: string }> => {
  try {
    console.log('🔍 Buscando cuellos de botella recurrentes');

    let query = supabase
      .from('meeting_bottlenecks')
      .select('*')
      .eq('recurrente', true)
      .order('created_at', { ascending: false });

    if (departamento) {
      query = query.eq('departamento', departamento);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error buscando cuellos de botella recurrentes:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Cuellos de botella recurrentes encontrados:', data?.length || 0);
    return { success: true, bottlenecks: data || [] };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al buscar cuellos de botella recurrentes' };
  }
};

/**
 * Obtener evolución de objetivos de un departamento
 */
export const getObjectivesEvolution = async (
  departamento: string,
  objetivo: string
): Promise<{ success: boolean; evolution?: any[]; error?: string }> => {
  try {
    console.log('📊 Obteniendo evolución de objetivo:', { departamento, objetivo });

    const { data, error } = await supabase
      .from('meeting_objectives')
      .select('valor_objetivo, created_at, cumplido')
      .eq('departamento', departamento)
      .eq('nombre', objetivo)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error obteniendo evolución:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Evolución obtenida:', data?.length || 0, 'puntos');
    return { success: true, evolution: data || [] };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al obtener evolución' };
  }
};
