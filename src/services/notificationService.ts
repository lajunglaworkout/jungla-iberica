import { supabase } from '../lib/supabase';

/**
 * Servicio para gestionar notificaciones de tareas
 */

// Crear notificación de tarea asignada
export const createTaskNotification = async (
  taskId: number,
  userEmail: string,
  taskTitle: string,
  meetingTitle: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_email: userEmail,
        type: 'task_assigned',
        title: `Nueva tarea: ${taskTitle}`,
        message: `Se te ha asignado una tarea de la reunión "${meetingTitle}"`,
        task_id: taskId,
        is_read: false,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error creando notificación:', error);
      return { success: false, error: error.message };
    }

    console.log('🔔 Notificación creada para:', userEmail);
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al crear notificación' };
  }
};

// Crear notificación de tarea completada
export const createTaskCompletedNotification = async (
  taskId: number,
  userEmail: string,
  taskTitle: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_email: userEmail,
        type: 'task_completed',
        title: `Tarea completada: ${taskTitle}`,
        message: `La tarea "${taskTitle}" ha sido marcada como completada`,
        task_id: taskId,
        is_read: false,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error creando notificación:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Notificación de tarea completada enviada');
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al crear notificación' };
  }
};

// Obtener notificaciones del usuario
export const getUserNotifications = async (
  userEmail: string,
  unreadOnly: boolean = false
): Promise<{ success: boolean; notifications?: any[]; error?: string }> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error cargando notificaciones:', error);
      return { success: false, error: error.message };
    }

    return { success: true, notifications: data || [] };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al cargar notificaciones' };
  }
};

// Marcar notificación como leída
export const markNotificationAsRead = async (
  notificationId: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marcando notificación como leída:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al marcar notificación' };
  }
};

// Obtener notificaciones no leídas
export const getUnreadNotificationsCount = async (
  userEmail: string
): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_email', userEmail)
      .eq('is_read', false);

    if (error) {
      console.error('Error contando notificaciones:', error);
      return { success: false, error: error.message };
    }

    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al contar notificaciones' };
  }
};

// Enviar notificación por email (simulado)
export const sendEmailNotification = async (
  userEmail: string,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`📧 Enviando email a ${userEmail}: ${subject}`);
    
    // En producción, aquí se llamaría a un servicio de email real
    // Por ahora solo registramos en la consola
    
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al enviar email' };
  }
};

// Crear notificación de tarea próxima a vencer
export const createTaskDueNotification = async (
  taskId: number,
  userEmail: string,
  taskTitle: string,
  daysUntilDue: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_email: userEmail,
        type: 'task_due_soon',
        title: `Tarea próxima a vencer: ${taskTitle}`,
        message: `La tarea "${taskTitle}" vence en ${daysUntilDue} día${daysUntilDue !== 1 ? 's' : ''}`,
        task_id: taskId,
        is_read: false,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error creando notificación:', error);
      return { success: false, error: error.message };
    }

    console.log('⏰ Notificación de tarea próxima a vencer enviada');
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Error al crear notificación' };
  }
};
