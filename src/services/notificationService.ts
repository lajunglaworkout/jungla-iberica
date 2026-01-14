// src/services/notificationService.ts
// Servicio para crear notificaciones desde otros módulos

import { supabase } from '../lib/supabase';
import { NotificationType, NotificationPriority, NotificationCreate } from '../types/notifications';

interface CreateNotificationOptions {
  link?: string;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
  expiresInHours?: number;
}

// Crear notificación genérica
export const createNotification = async (
  userId: number,
  type: NotificationType,
  title: string,
  body?: string,
  options?: CreateNotificationOptions
): Promise<string | null> => {
  try {
    const expiresAt = options?.expiresInHours
      ? new Date(Date.now() + options.expiresInHours * 3600000).toISOString()
      : undefined;

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body,
        link: options?.link,
        priority: options?.priority || 'normal',
        metadata: options?.metadata || {},
        expires_at: expiresAt,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

// Notificar nueva incidencia
export const notifyIncident = async (
  data: {
    incidentId: number;
    centerId: number;
    category: string;
    description: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    reporterName: string;
  }
): Promise<void> => {
  try {
    // Obtener encargados del centro
    const { data: managers, error } = await supabase
      .from('employees')
      .select('id')
      .eq('center_id', data.centerId)
      .in('role', ['center_manager', 'manager', 'admin', 'superadmin']);

    if (error) throw error;

    // Crear notificación para cada encargado
    for (const manager of managers || []) {
      await createNotification(
        manager.id,
        'incident',
        `Nueva incidencia: ${data.category}`,
        `Reportada por ${data.reporterName}: ${data.description.substring(0, 100)}...`,
        {
          priority: data.priority,
          link: 'incidents',
          metadata: { incident_id: data.incidentId, center_id: data.centerId }
        }
      );
    }
  } catch (err) {
    console.error('Error notifying incident:', err);
  }
};

// Notificar cambio de estado de incidencia
export const notifyIncidentStatusChange = async (
  data: {
    incidentId: number;
    reporterId: number;
    newStatus: string;
    resolverName?: string;
  }
): Promise<void> => {
  const statusMessages: Record<string, string> = {
    'resolved': '✅ Tu incidencia ha sido resuelta',
    'in_progress': '🔄 Tu incidencia está siendo atendida',
    'pending': '⏳ Tu incidencia está pendiente de revisión',
    'closed': '📁 Tu incidencia ha sido cerrada'
  };

  await createNotification(
    data.reporterId,
    'incident',
    statusMessages[data.newStatus] || `Estado actualizado: ${data.newStatus}`,
    data.resolverName ? `Atendida por ${data.resolverName}` : undefined,
    {
      priority: 'normal',
      link: 'incidents',
      metadata: { incident_id: data.incidentId }
    }
  );
};

// Notificar nuevo evento
export const notifyEvent = async (
  data: {
    eventId: number;
    eventName: string;
    eventDate: string;
    centerId: number;
    creatorName: string;
  }
): Promise<void> => {
  try {
    // Obtener empleados del centro
    const { data: employees, error } = await supabase
      .from('employees')
      .select('id')
      .eq('center_id', data.centerId)
      .eq('is_active', true);

    if (error) throw error;

    for (const emp of employees || []) {
      await createNotification(
        emp.id,
        'event',
        `📅 Nuevo evento: ${data.eventName}`,
        `Fecha: ${new Date(data.eventDate).toLocaleDateString('es-ES')} - Creado por ${data.creatorName}`,
        {
          priority: 'normal',
          link: 'events',
          metadata: { event_id: data.eventId }
        }
      );
    }
  } catch (err) {
    console.error('Error notifying event:', err);
  }
};

// Notificar recordatorio de evento
export const notifyEventReminder = async (
  data: {
    eventId: number;
    eventName: string;
    participantIds: number[];
    hoursUntilEvent: number;
  }
): Promise<void> => {
  const timeLabel = data.hoursUntilEvent <= 1
    ? '¡Es ahora!'
    : data.hoursUntilEvent <= 24
      ? `En ${data.hoursUntilEvent} horas`
      : `En ${Math.floor(data.hoursUntilEvent / 24)} días`;

  for (const participantId of data.participantIds) {
    await createNotification(
      participantId,
      'event',
      `⏰ Recordatorio: ${data.eventName}`,
      timeLabel,
      {
        priority: data.hoursUntilEvent <= 1 ? 'urgent' : data.hoursUntilEvent <= 24 ? 'high' : 'normal',
        link: 'events',
        metadata: { event_id: data.eventId },
        expiresInHours: data.hoursUntilEvent
      }
    );
  }
};

// Notificar mensaje de franquiciado
export const notifyFranchiseeMessage = async (
  data: {
    franchiseeName: string;
    centerName: string;
    messageCategory: string;
    messagePreview: string;
    priority: NotificationPriority;
  }
): Promise<void> => {
  try {
    // Obtener CEO y directores
    const { data: admins, error } = await supabase
      .from('employees')
      .select('id')
      .in('role', ['superadmin', 'admin', 'CEO', 'Director']);

    if (error) throw error;

    for (const admin of admins || []) {
      await createNotification(
        admin.id,
        'message',
        `📩 Mensaje de ${data.franchiseeName} (${data.centerName})`,
        `[${data.messageCategory}] ${data.messagePreview.substring(0, 80)}...`,
        {
          priority: data.priority,
          link: 'franquiciados',
          metadata: { category: data.messageCategory, center: data.centerName }
        }
      );
    }
  } catch (err) {
    console.error('Error notifying franchisee message:', err);
  }
};

// Notificar solicitud de vacaciones
export const notifyVacationRequest = async (
  data: {
    employeeId: number;
    employeeName: string;
    centerId: number;
    startDate: string;
    endDate: string;
    days: number;
  }
): Promise<void> => {
  try {
    // Obtener encargados del centro
    const { data: managers, error } = await supabase
      .from('employees')
      .select('id')
      .eq('center_id', data.centerId)
      .in('role', ['center_manager', 'manager']);

    if (error) throw error;

    const dateRange = `${new Date(data.startDate).toLocaleDateString('es-ES')} - ${new Date(data.endDate).toLocaleDateString('es-ES')}`;

    for (const manager of managers || []) {
      await createNotification(
        manager.id,
        'vacation',
        `🌴 Solicitud de vacaciones: ${data.employeeName}`,
        `${data.days} días: ${dateRange}`,
        {
          priority: 'high',
          link: 'hr',
          metadata: { employee_id: data.employeeId, start: data.startDate, end: data.endDate }
        }
      );
    }
  } catch (err) {
    console.error('Error notifying vacation request:', err);
  }
};

// Notificar respuesta a vacaciones
export const notifyVacationResponse = async (
  data: {
    employeeId: number;
    approved: boolean;
    approverName: string;
    startDate: string;
    endDate: string;
  }
): Promise<void> => {
  const dateRange = `${new Date(data.startDate).toLocaleDateString('es-ES')} - ${new Date(data.endDate).toLocaleDateString('es-ES')}`;

  await createNotification(
    data.employeeId,
    'vacation',
    data.approved
      ? '✅ Vacaciones aprobadas'
      : '❌ Vacaciones denegadas',
    `${dateRange} - Revisado por ${data.approverName}`,
    {
      priority: data.approved ? 'normal' : 'high',
      link: 'my-tasks'
    }
  );
};

// Notificar tarea asignada
export const notifyTaskAssigned = async (
  data: {
    taskId: number;
    taskTitle: string;
    assigneeId: number;
    assignerName: string;
    dueDate?: string;
  }
): Promise<void> => {
  const dueText = data.dueDate
    ? `Fecha límite: ${new Date(data.dueDate).toLocaleDateString('es-ES')}`
    : undefined;

  await createNotification(
    data.assigneeId,
    'task',
    `📋 Nueva tarea asignada`,
    `${data.taskTitle}${dueText ? ` - ${dueText}` : ''} (por ${data.assignerName})`,
    {
      priority: 'normal',
      link: 'my-tasks',
      metadata: { task_id: data.taskId }
    }
  );
};

// Notificar tarea próxima a vencer
export const notifyTaskDueSoon = async (
  data: {
    taskId: number;
    taskTitle: string;
    assigneeId: number;
    hoursUntilDue: number;
  }
): Promise<void> => {
  const urgency = data.hoursUntilDue <= 2
    ? { priority: 'urgent' as NotificationPriority, emoji: '🚨' }
    : data.hoursUntilDue <= 24
      ? { priority: 'high' as NotificationPriority, emoji: '⚠️' }
      : { priority: 'normal' as NotificationPriority, emoji: '⏰' };

  await createNotification(
    data.assigneeId,
    'task',
    `${urgency.emoji} Tarea próxima a vencer`,
    `"${data.taskTitle}" vence ${data.hoursUntilDue <= 1 ? 'en menos de 1 hora' : `en ${data.hoursUntilDue} horas`}`,
    {
      priority: urgency.priority,
      link: 'my-tasks',
      metadata: { task_id: data.taskId },
      expiresInHours: data.hoursUntilDue
    }
  );
};

// Notificación del sistema (para todos los admins)
export const notifySystemAlert = async (
  title: string,
  body: string,
  priority: NotificationPriority = 'normal'
): Promise<void> => {
  try {
    const { data: admins, error } = await supabase
      .from('employees')
      .select('id')
      .in('role', ['superadmin', 'admin']);

    if (error) throw error;

    for (const admin of admins || []) {
      await createNotification(
        admin.id,
        'system',
        title,
        body,
        { priority }
      );
    }
  } catch (err) {
    console.error('Error notifying system alert:', err);
  }
};

export default {
  createNotification,
  notifyIncident,
  notifyIncidentStatusChange,
  notifyEvent,
  notifyEventReminder,
  notifyFranchiseeMessage,
  notifyVacationRequest,
  notifyVacationResponse,
  notifyTaskAssigned,
  notifyTaskDueSoon,
  notifySystemAlert
};
