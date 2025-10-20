// src/services/shiftNotificationService.ts - Servicio de notificaciones de turnos
import { supabase } from '../lib/supabase';

export interface ShiftNotification {
  id?: number;
  shift_id: number;
  employee_id: string;
  employee_email: string;
  notification_type: 'published' | 'modified' | 'cancelled';
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  created_at?: string;
}

interface ShiftAssignment {
  employee_id: string;
  shift_id: number;
  date: string;
}

class ShiftNotificationService {
  /**
   * Enviar notificación de turno publicado
   */
  async notifyShiftPublished(shiftId: number, employeeEmails: string[]): Promise<void> {
    try {
      console.log(`📧 Enviando notificaciones de publicación para turno ${shiftId} a ${employeeEmails.length} empleados`);

      // Obtener información del turno
      const { data: shift, error: shiftError } = await supabase
        .from('shifts')
        .select('*, centers(name)')
        .eq('id', shiftId)
        .single();

      if (shiftError || !shift) {
        console.error('Error obteniendo turno:', shiftError);
        return;
      }

      // Obtener asignaciones del turno
      const { data: assignments, error: assignError } = await supabase
        .from('employee_shifts')
        .select('*, employees(nombre, apellidos, email)')
        .eq('shift_id', shiftId);

      if (assignError) {
        console.error('Error obteniendo asignaciones:', assignError);
        return;
      }

      // Crear notificaciones para cada empleado
      const notifications = (assignments || []).map((assignment: any) => ({
        shift_id: shiftId,
        employee_id: assignment.employee_id,
        employee_email: assignment.employees?.email || '',
        notification_type: 'published' as const,
        status: 'sent' as const,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('shift_notifications')
          .insert(notifications);

        if (insertError) {
          console.error('Error guardando notificaciones:', insertError);
        } else {
          console.log(`✅ ${notifications.length} notificaciones registradas`);
        }
      }

      // TODO: Aquí se integraría el envío real de emails
      // Por ahora solo simulamos el envío
      this.simulateEmailSending(shift, assignments || []);

    } catch (error) {
      console.error('Error en notifyShiftPublished:', error);
    }
  }

  /**
   * Enviar notificación de turno modificado
   */
  async notifyShiftModified(shiftId: number, changes: string): Promise<void> {
    try {
      console.log(`📧 Enviando notificaciones de modificación para turno ${shiftId}`);

      const { data: assignments } = await supabase
        .from('employee_shifts')
        .select('*, employees(email, nombre, apellidos)')
        .eq('shift_id', shiftId);

      const notifications = (assignments || []).map((assignment: any) => ({
        shift_id: shiftId,
        employee_id: assignment.employee_id,
        employee_email: assignment.employees?.email || '',
        notification_type: 'modified' as const,
        status: 'sent' as const,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }));

      if (notifications.length > 0) {
        await supabase
          .from('shift_notifications')
          .insert(notifications);

        console.log(`✅ Notificaciones de modificación enviadas a ${notifications.length} empleados`);
      }

    } catch (error) {
      console.error('Error en notifyShiftModified:', error);
    }
  }

  /**
   * Simular envío de email (para desarrollo)
   */
  private simulateEmailSending(shift: any, assignments: any[]): void {
    console.log('\n📧 ========== SIMULACIÓN DE EMAIL ==========');
    console.log(`Para: ${assignments.map((a: any) => a.employees?.email).join(', ')}`);
    console.log(`Asunto: 📅 Tus turnos han sido publicados`);
    console.log('\n--- CONTENIDO ---');
    console.log(`Hola,`);
    console.log(`\nSe han publicado tus turnos para:`);
    console.log(`\n🕐 Turno: ${shift.name}`);
    console.log(`⏰ Horario: ${shift.start_time} - ${shift.end_time}`);
    console.log(`📍 Centro: ${shift.centers?.name || 'N/A'}`);
    console.log(`\nPuedes ver los detalles completos en el CRM.`);
    console.log(`\nSaludos,`);
    console.log(`La Jungla Workout`);
    console.log('==========================================\n');
  }

  /**
   * Obtener historial de notificaciones de un turno
   */
  async getShiftNotifications(shiftId: number): Promise<ShiftNotification[]> {
    try {
      const { data, error } = await supabase
        .from('shift_notifications')
        .select('*')
        .eq('shift_id', shiftId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      return [];
    }
  }

  /**
   * Obtener notificaciones de un empleado
   */
  async getEmployeeNotifications(employeeId: string): Promise<ShiftNotification[]> {
    try {
      const { data, error } = await supabase
        .from('shift_notifications')
        .select('*')
        .eq('employee_id', employeeId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo notificaciones del empleado:', error);
      return [];
    }
  }
}

export const shiftNotificationService = new ShiftNotificationService();
