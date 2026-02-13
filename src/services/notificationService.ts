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

// Standalone exports for compatibility
// The following exports were incorrectly placed inside the object.
// They are moved outside to be syntactically correct.

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

export const notifyIncident = async (data: any) => {
  // Placeholder/Adapter for incident notifications
  // This needs to be implemented properly or adapted to use createNotification
  console.log('Faking notifyIncident', data);
  // Example adaptation:
  // return createNotification({ ... });
  return { success: true };
};

export const notifyVacationRequest = async (data: any) => {
  // Placeholder/Adapter for vacation request notifications
  console.log('Faking notifyVacationRequest', data);
  return { success: true };
};

export const notifyVacationResponse = async (data: any) => {
  // Placeholder/Adapter for vacation response notifications
  console.log('Faking notifyVacationResponse', data);
  return { success: true };
};
