import { supabase } from '../lib/supabase';

interface QuarterlyMaintenanceReview {
  id?: number;
  quarter: string;
  year: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  deadline_date?: string;
  created_by: string;
  created_date?: string;
  activated_at?: string;
  total_centers: number;
  completed_centers: number;
  notes?: string;
}

interface QuarterlyMaintenanceAssignment {
  id?: number;
  review_id: number;
  center_id: number;
  center_name: string;
  assigned_to?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  started_at?: string;
  completed_at?: string;
  completed_by?: string;
}

interface MaintenanceItem {
  id?: number;
  assignment_id: number;
  zone_id: string;
  zone_name: string;
  concept_id: string;
  concept_name: string;
  status: 'bien' | 'regular' | 'mal';
  observations?: string;
  task_to_perform?: string;
  task_priority: 'baja' | 'media' | 'alta' | 'critica';
  photos_deterioro?: string[];
  photos_reparacion?: string[];
  is_critical: boolean;
}

class QuarterlyMaintenanceService {

  // Crear nueva revisión (Director de Mantenimiento)
  async createReview(data: {
    quarter: string;
    year: number;
    deadline_date?: string;
    created_by: string;
    centers: Array<{ id: number; name: string }>;
    notes?: string;
  }) {
    try {
      console.log('🔧 Creando revisión trimestral de mantenimiento...');

      // Primero eliminar cualquier revisión existente para este quarter/year
      console.log(`🗑️ Eliminando revisión existente ${data.quarter}-${data.year} si existe...`);
      await this.deleteReview(data.quarter, data.year);

      const reviewData: QuarterlyMaintenanceReview = {
        quarter: data.quarter,
        year: data.year,
        status: 'draft',
        deadline_date: data.deadline_date,
        created_by: data.created_by,
        total_centers: data.centers.length,
        completed_centers: 0,
        notes: data.notes
      };

      const { data: review, error } = await supabase
        .from('quarterly_maintenance_reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Revisión de mantenimiento creada:`, review.id);
      return { success: true, review };
    } catch (error) {
      console.error('❌ Error creando revisión de mantenimiento:', error);
      return { success: false, error };
    }
  }

  // Eliminar revisión completa (Director de Mantenimiento)
  async deleteReview(quarter: string, year: number) {
    try {
      console.log(`🗑️ Eliminando revisión de mantenimiento ${quarter}-${year}...`);

      // 1. Obtener IDs de las revisiones a eliminar
      const { data: reviews, error: reviewsError } = await supabase
        .from('quarterly_maintenance_reviews')
        .select('id')
        .eq('quarter', quarter)
        .eq('year', year);

      if (reviewsError) {
        console.error('❌ Error obteniendo revisiones:', reviewsError);
        return { success: false, error: reviewsError };
      }

      if (!reviews || reviews.length === 0) {
        console.log('⚠️ No hay revisiones para eliminar');
        return { success: true };
      }

      const reviewIds = reviews.map(r => r.id);
      console.log('📋 IDs de revisiones a eliminar:', reviewIds);

      // 2. Obtener IDs de asignaciones
      const { data: assignments, error: assignmentsError } = await supabase
        .from('quarterly_maintenance_assignments')
        .select('id')
        .in('review_id', reviewIds);

      if (assignments && assignments.length > 0) {
        const assignmentIds = assignments.map(a => a.id);
        console.log('📋 IDs de asignaciones a eliminar:', assignmentIds);

        // 3. Eliminar items de revisión
        const { error: itemsError } = await supabase
          .from('quarterly_maintenance_items')
          .delete()
          .in('assignment_id', assignmentIds);

        if (itemsError) {
          console.error('❌ Error eliminando items:', itemsError);
        } else {
          console.log('✅ Items de revisión eliminados');
        }

        // 4. Eliminar asignaciones
        const { error: assignmentsDeleteError } = await supabase
          .from('quarterly_maintenance_assignments')
          .delete()
          .in('id', assignmentIds);

        if (assignmentsDeleteError) {
          console.error('❌ Error eliminando asignaciones:', assignmentsDeleteError);
        } else {
          console.log('✅ Asignaciones eliminadas');
        }
      }

      // 5. Eliminar revisiones
      const { error: reviewsDeleteError } = await supabase
        .from('quarterly_maintenance_reviews')
        .delete()
        .in('id', reviewIds);

      if (reviewsDeleteError) {
        console.error('❌ Error eliminando revisiones:', reviewsDeleteError);
        return { success: false, error: reviewsDeleteError };
      }

      console.log(`✅ Revisión de mantenimiento ${quarter}-${year} eliminada completamente`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando revisión:', error);
      return { success: false, error };
    }
  }

  // Activar revisión y crear asignaciones (Director de Mantenimiento)
  async activateReview(reviewId: number, centers: Array<{ id: number; name: string }>, encargadosEmails: Record<number, string>) {
    try {
      console.log('🚀 Activando revisión de mantenimiento:', reviewId);

      // 1. Actualizar status de la revisión
      const { data: review, error: reviewError } = await supabase
        .from('quarterly_maintenance_reviews')
        .update({
          status: 'active',
          activated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (reviewError) throw reviewError;

      // 2. Crear asignaciones para cada centro
      const assignments = [];
      for (const center of centers) {
        const encargadoEmail = encargadosEmails[center.id];

        const assignmentData: QuarterlyMaintenanceAssignment = {
          review_id: reviewId,
          center_id: center.id,
          center_name: center.name,
          assigned_to: encargadoEmail,
          status: 'pending'
        };

        const { data: assignment, error: assignmentError } = await supabase
          .from('quarterly_maintenance_assignments')
          .insert(assignmentData)
          .select()
          .single();

        if (assignmentError) throw assignmentError;

        console.log(`✅ Asignación creada para ${center.name}:`, assignment.id);
        assignments.push(assignment);

        // 3. Enviar notificación al encargado
        if (encargadoEmail) {
          await this.sendNotification({
            review_id: reviewId,
            user_email: encargadoEmail,
            notification_type: 'review_assigned',
            message: `Nueva revisión trimestral de mantenimiento asignada: ${review.quarter} - ${center.name}. Fecha límite: ${review.deadline_date || 'Sin definir'}`
          });
        }
      }

      console.log('✅ Revisión activada y asignaciones creadas');
      return { success: true, review, assignments };
    } catch (error) {
      console.error('❌ Error activando revisión:', error);
      return { success: false, error };
    }
  }

  // Obtener revisiones
  async getReviews(filters?: {
    status?: string;
    quarter?: string;
    year?: number;
  }) {
    try {
      let query = supabase
        .from('quarterly_maintenance_reviews')
        .select('*')
        .order('created_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.quarter) {
        query = query.eq('quarter', filters.quarter);
      }
      if (filters?.year) {
        query = query.eq('year', filters.year);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, reviews: data };
    } catch (error) {
      console.error('❌ Error obteniendo revisiones:', error);
      return { success: false, error };
    }
  }

  // Obtener asignaciones de un encargado o de una revisión
  async getAssignments(centerId?: number, status?: string, reviewId?: number) {
    try {
      let query = supabase
        .from('quarterly_maintenance_assignments')
        .select(`
          *,
          review:quarterly_maintenance_reviews(*)
        `);

      if (centerId && centerId > 0) {
        console.log('🔍 Buscando asignaciones de mantenimiento para centro:', centerId);
        query = query.eq('center_id', centerId);
      } else if (reviewId) {
        console.log('🔍 Buscando asignaciones de mantenimiento para revisión:', reviewId);
        query = query.eq('review_id', reviewId);
      } else {
        console.log('🔍 Buscando todas las asignaciones de mantenimiento');
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error en query:', error);
        throw error;
      }

      console.log('✅ Asignaciones encontradas:', data?.length || 0);
      return { success: true, assignments: data };
    } catch (error) {
      console.error('❌ Error obteniendo asignaciones:', error);
      return { success: false, error };
    }
  }

  // Guardar items de la revisión
  async saveReviewItems(assignmentId: number, items: any[]) {
    try {
      console.log('💾 Guardando items de revisión de mantenimiento...');
      console.log('📋 Items a guardar:', items.length);

      const { data, error } = await supabase
        .from('quarterly_maintenance_items')
        .upsert(items.map(item => ({
          ...item,
          assignment_id: assignmentId
        })))
        .select();

      if (error) throw error;

      console.log(`✅ ${data.length} items guardados`);
      return { success: true, items: data };
    } catch (error) {
      console.error('❌ Error guardando items:', error);
      return { success: false, error };
    }
  }

  // Completar asignación (Encargado)
  async completeAssignment(assignmentId: number, completedBy: string) {
    try {
      console.log('✅ Completando asignación de mantenimiento:', assignmentId);

      const { data, error } = await supabase
        .from('quarterly_maintenance_assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: completedBy
        })
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;

      // Obtener items críticos (mal estado) para notificar
      const { data: criticalItems } = await supabase
        .from('quarterly_maintenance_items')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('status', 'mal');

      // Notificar al director de mantenimiento sobre incidencias
      if (criticalItems && criticalItems.length > 0) {
        await this.sendNotification({
          review_id: data.review_id,
          user_email: 'beni.jungla@gmail.com', // Email del director de mantenimiento
          notification_type: 'review_completed_with_issues',
          message: `Revisión de mantenimiento completada por ${completedBy} en ${data.center_name}. Se encontraron ${criticalItems.length} incidencias que requieren atención.`,
          deadline_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Plazo de 7 días
        });
      } else {
        await this.sendNotification({
          review_id: data.review_id,
          user_email: 'beni.jungla@gmail.com',
          notification_type: 'review_completed',
          message: `Revisión de mantenimiento completada por ${completedBy} en ${data.center_name}. Sin incidencias reportadas.`
        });
      }

      return { success: true, assignment: data, criticalItems };
    } catch (error) {
      console.error('❌ Error completando asignación:', error);
      return { success: false, error };
    }
  }

  // Enviar notificación
  private async sendNotification(data: {
    review_id: number;
    user_email: string;
    notification_type: string;
    message: string;
    deadline_date?: string;
  }) {
    try {
      const { error } = await supabase
        .from('notifications') // Corregido: tabla unificada
        .insert({
          recipient_email: data.user_email,
          type: data.notification_type,
          title: 'Gestión de Mantenimiento',
          message: data.message,
          reference_type: 'quarterly_maintenance_review',
          reference_id: data.review_id.toString(),
          is_read: false
        });

      if (error) {
        console.error('❌ Error Supabase enviando notificación:', error);
        throw error;
      }
      console.log('📧 Notificación enviada a:', data.user_email);
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
    }
  }
}

export const quarterlyMaintenanceService = new QuarterlyMaintenanceService();
export default quarterlyMaintenanceService;
