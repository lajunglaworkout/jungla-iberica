import { supabase } from '../lib/supabase';

export interface Notification {
  id: number;
  recipient_email: string;
  type: 'task_assigned' | 'task_deadline' | 'meeting_scheduled' | 'general';
  title: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  /**
   * Get unread notifications for a user
   */
  getUnreadNotifications: async (email: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_email', email)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  },

  /**
   * Get all notifications for a user (with pagination limit)
   */
  getAllNotifications: async (email: string, limit = 50) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_email', email)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Notification[];
  },

  /**
   * Create a new notification
   */
  createNotification: async (notification: Omit<Notification, 'id' | 'is_read' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      // Don't throw to avoid blocking main flow
      return null;
    }
    return data as Notification;
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: number) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Delete notifications for a specific task
   */
  deleteTaskNotifications: async (taskId: string | number) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('reference_id', taskId.toString())
      .eq('reference_type', 'task');

    if (error) {
      console.error('Error deleting task notifications:', error);
      // We don't throw here to avoid blocking task completion if notification cleanup fails
    }
  }
};

// ============================================================
// Standalone exports for compatibility
// ============================================================

export const getUserNotifications = async (email: string, unreadOnly = false) => {
  try {
    const data = unreadOnly
      ? await notificationService.getUnreadNotifications(email)
      : await notificationService.getAllNotifications(email);
    return { success: true, notifications: data };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { success: false, error };
  }
};

export const createNotification = notificationService.createNotification;
export const markNotificationAsRead = notificationService.markAsRead;
export const deleteTaskNotifications = notificationService.deleteTaskNotifications;

// ============================================================
// Tipos para payloads de notificación
// ============================================================

/** Payload base: cualquier combinación de campos conocidos */
export interface NotificationPayload {
  recipientEmail?: string;
  email?: string;
  userEmail?: string;
  managerEmail?: string;
  employeeEmail?: string;
  employeeId?: string | number;
  userId?: string | number;
  user_id?: string | number;
  employee_id?: string | number;
  // Incidencias
  incidentTitle?: string;
  incidentId?: string | number;
  titulo?: string;
  description?: string;
  centerName?: string;
  priority?: string;
  prioridad?: string;
  // Vacaciones
  employeeName?: string;
  nombre?: string;
  startDate?: string;
  endDate?: string;
  requestId?: string | number;
  approved?: boolean;
  status?: string;
  estado?: string;
  managerName?: string;
  // Tareas
  taskTitle?: string;
  title?: string;
  taskId?: string | number;
  assignedBy?: string;
  deadline?: string;
  fecha_limite?: string;
  asignado_a?: string;
  descripcion?: string;
  // Eventos
  eventTitle?: string;
  eventId?: string | number;
  eventDate?: string;
  fecha?: string;
  message?: string;
  // Mensajes de franquiciados
  senderName?: string;
  messageId?: string | number;
  messagePreview?: string;
  // Genérico
  id?: string | number;
}

// ============================================================
// Helper: resolve recipient email (supports legacy callers that pass userId/employeeId)
// ============================================================

const resolveEmail = async (data: NotificationPayload, emailKey: Array<keyof NotificationPayload> = ['recipientEmail', 'email', 'userEmail', 'managerEmail', 'employeeEmail']): Promise<string | null> => {
  // Try direct email fields first
  for (const key of emailKey) {
    if (data[key] && typeof data[key] === 'string' && data[key].includes('@')) {
      return data[key];
    }
  }

  // Try to look up by employee ID from Supabase
  const idKey = (['employeeId', 'userId', 'user_id', 'employee_id'] as Array<keyof NotificationPayload>).find(k => data[k] != null);
  if (idKey) {
    try {
      const { data: emp } = await supabase
        .from('employees')
        .select('email')
        .eq('id', data[idKey])
        .single();
      if (emp?.email) return emp.email;
    } catch (_) { /* silent */ }
  }

  return null;
};

// ============================================================
// Notificaciones de incidencias
// ============================================================

export const notifyIncident = async (data: NotificationPayload) => {
  try {
    const email = await resolveEmail(data);
    const title = data.incidentTitle ?? data.titulo ?? data.description ?? 'Nueva incidencia';
    if (!email) { console.warn('notifyIncident: no recipient email', data); return { success: false }; }
    await createNotification({
      recipient_email: email,
      type: 'general',
      title: `🚨 Nueva incidencia: ${title}`,
      message: `Se ha reportado una nueva incidencia${data.centerName ? ` en ${data.centerName}` : ''}${data.priority || data.prioridad ? ` (${data.priority ?? data.prioridad})` : ''}.`,
      reference_type: 'incident',
      reference_id: (data.incidentId ?? data.id)?.toString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error notifyIncident:', error);
    return { success: false, error };
  }
};

export const notifyIncidentStatusChange = async (data: NotificationPayload) => {
  try {
    const email = await resolveEmail(data);
    const title = data.incidentTitle ?? data.titulo ?? 'Incidencia';
    if (!email) { console.warn('notifyIncidentStatusChange: no recipient email', data); return { success: false }; }
    const statusLabels: Record<string, string> = { abierta: '🔴 Abierta', en_progreso: '🟡 En progreso', resuelta: '✅ Resuelta', cerrada: '⚫ Cerrada' };
    const newStatus = data.newStatus ?? data.status ?? data.estado ?? '';
    const label = statusLabels[newStatus] ?? newStatus;
    await createNotification({
      recipient_email: email,
      type: 'general',
      title: `Incidencia actualizada: ${title}`,
      message: `El estado ha cambiado a ${label}.`,
      reference_type: 'incident',
      reference_id: (data.incidentId ?? data.id)?.toString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error notifyIncidentStatusChange:', error);
    return { success: false, error };
  }
};

// ============================================================
// Notificaciones de vacaciones
// ============================================================

export const notifyVacationRequest = async (data: NotificationPayload) => {
  try {
    const email = await resolveEmail(data, ['managerEmail', 'recipientEmail', 'email']);
    const employeeName = data.employeeName ?? data.nombre ?? 'Un empleado';
    if (!email) { console.warn('notifyVacationRequest: no manager email', data); return { success: false }; }
    await createNotification({
      recipient_email: email,
      type: 'general',
      title: `📅 Solicitud de vacaciones: ${employeeName}`,
      message: `${employeeName} ha solicitado vacaciones${data.startDate ? ` del ${data.startDate}` : ''}${data.endDate ? ` al ${data.endDate}` : ''}. Requiere aprobación.`,
      reference_type: 'vacation_request',
      reference_id: (data.requestId ?? data.id)?.toString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error notifyVacationRequest:', error);
    return { success: false, error };
  }
};

export const notifyVacationResponse = async (data: NotificationPayload) => {
  try {
    const email = await resolveEmail(data, ['employeeEmail', 'recipientEmail', 'email']);
    if (!email) { console.warn('notifyVacationResponse: no employee email', data); return { success: false }; }
    const approved = data.approved ?? data.status === 'approved' ?? data.status === 'aprobada';
    await createNotification({
      recipient_email: email,
      type: 'general',
      title: approved ? '✅ Vacaciones aprobadas' : '❌ Vacaciones denegadas',
      message: approved
        ? `Tus vacaciones han sido aprobadas${data.managerName ? ` por ${data.managerName}` : ''}.`
        : `Tu solicitud de vacaciones ha sido denegada${data.managerName ? ` por ${data.managerName}` : ''}.`,
      reference_type: 'vacation_request',
      reference_id: (data.requestId ?? data.id)?.toString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error notifyVacationResponse:', error);
    return { success: false, error };
  }
};

// ============================================================
// Notificaciones de tareas
// ============================================================

export const notifyTaskAssigned = async (data: NotificationPayload) => {
  try {
    const email = await resolveEmail(data, ['recipientEmail', 'email', 'userEmail', 'asignado_a']);
    const title = data.taskTitle ?? data.titulo ?? data.title ?? data.descripcion ?? 'Nueva tarea';
    if (!email) { console.warn('notifyTaskAssigned: no recipient email', data); return { success: false }; }
    const deadlineText = (data.deadline ?? data.fecha_limite) ? ` Fecha límite: ${data.deadline ?? data.fecha_limite}.` : '';
    await createNotification({
      recipient_email: email,
      type: 'task_assigned',
      title: `📋 Tarea asignada: ${title}`,
      message: `Se te ha asignado una nueva tarea${data.assignedBy ? ` por ${data.assignedBy}` : ''}.${deadlineText}`,
      reference_type: 'task',
      reference_id: (data.taskId ?? data.id)?.toString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error notifyTaskAssigned:', error);
    return { success: false, error };
  }
};

export const createTaskNotification = async (data: NotificationPayload) => notifyTaskAssigned(data);

// ============================================================
// Notificaciones de eventos
// ============================================================

export const notifyEvent = async (data: NotificationPayload) => {
  try {
    const email = await resolveEmail(data);
    const title = data.eventTitle ?? data.titulo ?? data.title ?? 'Nuevo evento';
    if (!email) { console.warn('notifyEvent: no recipient email', data); return { success: false }; }
    await createNotification({
      recipient_email: email,
      type: 'general',
      title: `🎉 Evento: ${title}`,
      message: data.message ?? `Hay un nuevo evento${data.eventDate ?? data.fecha ? ` el ${data.eventDate ?? data.fecha}` : ''}.`,
      reference_type: 'event',
      reference_id: (data.eventId ?? data.id)?.toString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error notifyEvent:', error);
    return { success: false, error };
  }
};

// ============================================================
// Notificaciones de mensajes de franquiciados
// ============================================================

export const notifyFranchiseeMessage = async (data: NotificationPayload) => {
  try {
    const email = await resolveEmail(data);
    const sender = data.senderName ?? data.nombre ?? 'Un franquiciado';
    if (!email) { console.warn('notifyFranchiseeMessage: no recipient email', data); return { success: false }; }
    await createNotification({
      recipient_email: email,
      type: 'message',
      title: `💬 Mensaje de ${sender}`,
      message: data.messagePreview ?? data.message ?? `Tienes un nuevo mensaje de ${sender}.`,
      reference_type: 'franchisee_message',
      reference_id: (data.messageId ?? data.id)?.toString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error notifyFranchiseeMessage:', error);
    return { success: false, error };
  }
};

// ============================================================
// Notificación de reunión programada
// ============================================================

export const notifyMeetingScheduled = async (data: {
  recipientEmail: string;
  meetingTitle: string;
  meetingId?: string | number;
  meetingDate?: string;
  meetingTime?: string;
  scheduledBy?: string;
}) => {
  try {
    const dateText = data.meetingDate
      ? ` para el ${data.meetingDate}${data.meetingTime ? ` a las ${data.meetingTime}` : ''}`
      : '';
    await createNotification({
      recipient_email: data.recipientEmail,
      type: 'meeting_scheduled',
      title: `📅 Reunión convocada: ${data.meetingTitle}`,
      message: `Se ha convocado una reunión${dateText}${data.scheduledBy ? ` por ${data.scheduledBy}` : ''}.`,
      reference_type: 'meeting',
      reference_id: data.meetingId?.toString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error notifyMeetingScheduled:', error);
    return { success: false, error };
  }
};
