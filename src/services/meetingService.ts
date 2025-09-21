import { supabase } from '../lib/supabase';
import { Task } from '../types/dashboard';
import { createMeetingAlert, getDepartmentResponsible } from '../config/departments';

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
  kpis?: any;
  tasks?: any;
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
  const responsible = getDepartmentResponsible(task.department || '');
  
  return {
    title: task.title,
    department: task.department || 'Sin asignar',
    type: task.meetingType || 'weekly',
    date: task.startDate,
    start_time: task.startTime,
    end_time: task.endTime,
    duration_minutes: task.endTime ? calculateDuration(task.startTime, task.endTime) : undefined,
    participants: responsible ? [responsible.email] : [],
    leader_email: 'carlossuarezparra@gmail.com', // CEO siempre es el líder
    agenda: task.description,
    objectives: [],
    kpis: {},
    tasks: {},
    notes: task.notes,
    summary: '',
    status: task.status as any || 'scheduled',
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
    status: meeting.status as any || 'pending',
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
        // Aquí se podría guardar la alerta en una tabla de notificaciones
        console.log('🔔 Alerta creada:', alert);
        
        // TODO: Guardar alerta en tabla notifications
        // await saveNotificationToSupabase(alert);
      }
    }

    return { success: true, meeting: data };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al guardar la reunión' };
  }
};

// Cargar reuniones desde Supabase
export const loadMeetingsFromSupabase = async (): Promise<{ success: boolean; meetings?: Task[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error cargando reuniones:', error);
      return { success: false, error: error.message };
    }

    const tasks = data.map(meetingRecordToTask);
    console.log('✅ Reuniones cargadas desde Supabase:', tasks.length);

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
