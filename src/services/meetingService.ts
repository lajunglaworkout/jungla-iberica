import { supabase } from '../lib/supabase';
import { Task } from '../types/dashboard';
import { createMeetingAlert, getDepartmentResponsible } from '../config/departments';
import { deleteTasksByMeetingId } from './taskService';
import { notifyMeetingScheduled } from './notificationService';

export interface MeetingRecord {
  id?: number;
  title: string;
  department: string;
  type: 'weekly' | 'monthly' | 'quarterly';
  date: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  participants: string[];
  leader_email: string;
  agenda?: string;
  objectives?: string[];
  kpis?: Record<string, unknown>;
  tasks?: Record<string, unknown>;
  notes?: string;
  summary?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  completion_percentage: number;
  created_at?: string;
  updated_at?: string;
  created_by: string;
}

// Convertir Task a MeetingRecord para Supabase
export const taskToMeetingRecord = (task: Task): MeetingRecord => {
  // 🔧 NUEVO: Obtener participantes basándose en assignmentType y assignmentId
  let participants: string[] = [];

  // Si tiene assignmentType y assignmentId (nuevo sistema)
  if (task.assignmentType && task.assignmentId) {
    if (task.assignmentType === 'corporativo') {
      // Es un departamento corporativo
      const responsible = getDepartmentResponsible(task.assignmentId);
      if (responsible) {
        participants = [responsible.email];
      }
    } else if (task.assignmentType === 'centro') {
      // Es un empleado específico de un centro
      // El assignmentId es el ID del empleado, necesitamos su email
      // Por ahora, usamos el assignmentId como email temporal
      // TODO: Mejorar para obtener el email real del empleado
      participants = [task.assignmentId];
    }
  }
  // Fallback: usar el sistema antiguo de department
  else if (task.department) {
    const responsible = getDepartmentResponsible(task.department);
    if (responsible) {
      participants = [responsible.email];
    }
  }

  return {
    title: task.title,
    department: task.assignmentId || task.department || 'Sin asignar',
    type: task.meetingType || 'weekly',
    date: task.startDate,
    start_time: task.startTime,
    end_time: task.endTime,
    duration_minutes: task.endTime ? calculateDuration(task.startTime, task.endTime) : undefined,
    participants: participants,
    leader_email: task.createdBy || 'carlossuarezparra@gmail.com',
    agenda: task.description,
    objectives: [],
    kpis: {},
    tasks: {},
    notes: task.notes,
    summary: '',
    status: (task.status as MeetingRecord['status']) || 'scheduled',
    completion_percentage: 0,
    created_by: task.createdBy || 'carlossuarezparra@gmail.com'
  };
};

// Convertir MeetingRecord a Task para la UI
export const meetingRecordToTask = (meeting: MeetingRecord): Task => {
  return {
    id: meeting.id?.toString() || `meeting-${Date.now()}`,
    title: meeting.title,
    description: meeting.agenda,
    startDate: meeting.date,
    startTime: meeting.start_time,
    endTime: meeting.end_time,
    isRecurring: meeting.type !== 'quarterly',
    recurrenceRule: {
      pattern: meeting.type === 'weekly' ? 'weekly' : 'monthly',
      interval: 1,
      daysOfWeek: meeting.type === 'weekly' ? [1] : undefined
    },
    category: 'meeting',
    meetingType: meeting.type === 'quarterly' ? 'monthly' : meeting.type,
    department: meeting.department,
    priority: 'high',
    status: meeting.status || 'pending',
    assignedTo: meeting.participants.join(', '),
    location: '',
    notes: meeting.notes,
    createdAt: meeting.created_at || new Date().toISOString(),
    updatedAt: meeting.updated_at || new Date().toISOString(),
    createdBy: meeting.created_by
  };
};

// Calcular duración en minutos
const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes - startMinutes;
};

// Guardar reunión en Supabase
export const saveMeetingToSupabase = async (task: Task): Promise<{ success: boolean; error?: string; meeting?: MeetingRecord }> => {
  try {
    const meetingRecord = taskToMeetingRecord(task);

    const { data, error } = await supabase
      .from('meetings')
      .insert([meetingRecord])
      .select()
      .single();

    if (error) {
      console.error('Error guardando reunión:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Reunión guardada en Supabase:', data);

    // Crear alerta para el responsable del departamento
    if (task.department) {
      const alert = createMeetingAlert(
        task.title,
        task.startDate,
        task.startTime,
        task.department,
        task.description
      );

      if (alert) {
        // Guardar notificación en Supabase para el responsable del departamento
        await notifyMeetingScheduled({
          recipientEmail: alert.targetEmail,
          meetingTitle: task.title,
          meetingId: data?.id,
          meetingDate: task.startDate,
          meetingTime: task.startTime,
          scheduledBy: task.createdBy,
        });
      }
    }

    return { success: true, meeting: data };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al guardar la reunión' };
  }
};

// Cargar reuniones desde Supabase
// 🔧 NUEVO: Filtrar por participantes para que cada usuario vea sus reuniones
export const loadMeetingsFromSupabase = async (userEmail?: string): Promise<{ success: boolean; meetings?: Task[]; error?: string }> => {
  try {
    let query = supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false });

    // 🔧 FILTRO POR PARTICIPANTES: Si se proporciona email, filtrar reuniones
    if (userEmail) {
      // Cargar reuniones donde el usuario es:
      // 1. Creador (created_by)
      // 2. Líder (leader_email)
      // 3. Participante (en el array participants)
      query = query.or(`created_by.eq.${userEmail},leader_email.eq.${userEmail},participants.cs.{${userEmail}}`);
      console.log(`🔍 Filtrando reuniones para: ${userEmail}`);
    } else {
      console.log('📋 Cargando todas las reuniones (sin filtro)');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error cargando reuniones:', error);
      return { success: false, error: error.message };
    }

    const tasks = data.map(meetingRecordToTask);
    console.log(`✅ Reuniones cargadas: ${tasks.length} reuniones`);

    return { success: true, meetings: tasks };
  } catch (error) {
    console.error('Error inesperado cargando reuniones:', error);
    return { success: false, error: 'Error inesperado al cargar reuniones' };
  }
};

// Actualizar reunión en Supabase
export const updateMeetingInSupabase = async (task: Task): Promise<{ success: boolean; error?: string }> => {
  try {
    const meetingRecord = taskToMeetingRecord(task);
    const meetingId = parseInt(task.id);

    if (isNaN(meetingId)) {
      return { success: false, error: 'ID de reunión inválido' };
    }

    const { error } = await supabase
      .from('meetings')
      .update(meetingRecord)
      .eq('id', meetingId);

    if (error) {
      console.error('Error actualizando reunión:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Reunión actualizada en Supabase');
    return { success: true };
  } catch (error) {
    console.error('Error inesperado actualizando reunión:', error);
    return { success: false, error: 'Error inesperado al actualizar la reunión' };
  }
};

// Eliminar reunión de Supabase
export const deleteMeetingFromSupabase = async (taskId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const meetingId = parseInt(taskId);

    if (isNaN(meetingId)) {
      return { success: false, error: 'ID de reunión inválido' };
    }

    // 🗑️ Primero eliminar tareas asociadas (Cascade manual)
    const tasksResult = await deleteTasksByMeetingId(meetingId);
    if (!tasksResult.success) {
      console.warn('Advertencia: No se pudieron eliminar las tareas asociadas', tasksResult.error);
      // Continuamos con el borrado de la reunión aunque fallen las tareas, 
      // pero idealmente debería ser una transacción.
    }

    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', meetingId);

    if (error) {
      console.error('Error eliminando reunión:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Reunión eliminada de Supabase');
    return { success: true };
  } catch (error) {
    console.error('Error inesperado eliminando reunión:', error);
    return { success: false, error: 'Error inesperado al eliminar la reunión' };
  }
};

// Obtener reuniones por departamento
export const getMeetingsByDepartment = async (department: string): Promise<{ success: boolean; meetings?: Task[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('department', department)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error cargando reuniones por departamento:', error);
      return { success: false, error: error.message };
    }

    const tasks = data.map(meetingRecordToTask);
    console.log(`✅ Reuniones de ${department} cargadas:`, tasks.length);

    return { success: true, meetings: tasks };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al cargar reuniones del departamento' };
  }
};

/** Returns raw DB records (no Task conversion) — for components that use DB field names directly */
export const getMeetingRecordsRaw = async (userEmail?: string): Promise<Record<string, unknown>[]> => {
  try {
    let query = supabase.from('meetings').select('*').order('created_at', { ascending: false });
    if (userEmail) query = query.or(`created_by.eq.${userEmail},leader_email.eq.${userEmail},participants.cs.{${userEmail}}`);
    const { data, error } = await query;
    if (error) { console.error('Error cargando reuniones:', error); return []; }
    return data || [];
  } catch { return []; }
};

export const scheduleMeeting = async (record: Record<string, unknown>): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> => {
  try {
    const { data, error } = await supabase.from('meetings').insert(record).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Record<string, unknown> };
  } catch { return { success: false, error: 'Error programando reunión' }; }
};

export const createObjective = async (objective: Record<string, unknown>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('objetivos').insert(objective);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error creando objetivo' }; }
};

export const createObjectives = async (objectives: Record<string, unknown>[]): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('objetivos').insert(objectives);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error creando objetivos' }; }
};

export const getAllMeetings = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase.from('meetings').select('*').order('date', { ascending: false });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const createReunion = async (
  data: Record<string, unknown>
): Promise<{ success: boolean; record?: Record<string, unknown>; error?: string }> => {
  try {
    const { data: record, error } = await supabase.from('reuniones').insert([data]).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, record: record as Record<string, unknown> };
  } catch { return { success: false, error: 'Error creando reunión' }; }
};

export const createMeetingTasks = async (
  tasks: Record<string, unknown>[]
): Promise<{ success: boolean; data?: Record<string, unknown>[]; error?: string }> => {
  try {
    const { data, error } = await supabase.from('tareas').insert(tasks).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Record<string, unknown>[] };
  } catch { return { success: false, error: 'Error creando tareas' }; }
};

export const updateMeetingTasks = async (meetingId: string | number, tasks: Record<string, unknown>[]): Promise<{ success: boolean; error?: string }> => {
  try {
    const id = typeof meetingId === 'string' ? parseInt(meetingId) : meetingId;
    const { error } = await supabase.from('meetings').update({ tasks }).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al actualizar tareas de la reunión' };
  }
};
