import { supabase } from '../lib/supabase';

interface QuarterlyReview {
  id?: number;
  center_id: number;
  center_name: string;
  quarter: string;
  year: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  deadline_date?: string;
  created_by: string;
  created_date?: string;
  activated_at?: string;
  total_items: number;
  total_discrepancies: number;
  notes?: string;
}

interface QuarterlyReviewAssignment {
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

interface QuarterlyReviewItem {
  id?: number;
  assignment_id: number;
  inventory_item_id: number;
  product_name: string;
  category?: string;
  current_system_quantity: number;
  counted_quantity: number;
  regular_state_quantity: number;
  deteriorated_quantity: number;
  to_remove_quantity: number;
  observations?: string;
  status: 'pending' | 'counted' | 'verified';
}

class QuarterlyInventoryService {
  
  // Eliminar revisión completa (Beni)
  async deleteReview(quarter: string, year: number) {
    try {
      console.log(`🗑️ Eliminando revisión ${quarter}-${year}...`);

      // 1. Eliminar items de revisión
      const { error: itemsError } = await supabase
        .from('quarterly_review_items')
        .delete()
        .in('assignment_id', 
          supabase
            .from('quarterly_inventory_assignments')
            .select('id')
            .in('review_id',
              supabase
                .from('quarterly_reviews')
                .select('id')
                .eq('quarter', quarter)
                .eq('year', year)
            )
        );

      if (itemsError) {
        console.error('❌ Error eliminando items:', itemsError);
      } else {
        console.log('✅ Items de revisión eliminados');
      }

      // 2. Eliminar asignaciones
      const { error: assignmentsError } = await supabase
        .from('quarterly_inventory_assignments')
        .delete()
        .in('review_id',
          supabase
            .from('quarterly_reviews')
            .select('id')
            .eq('quarter', quarter)
            .eq('year', year)
        );

      if (assignmentsError) {
        console.error('❌ Error eliminando asignaciones:', assignmentsError);
      } else {
        console.log('✅ Asignaciones eliminadas');
      }

      // 3. Eliminar revisiones
      const { error: reviewsError } = await supabase
        .from('quarterly_reviews')
        .delete()
        .eq('quarter', quarter)
        .eq('year', year);

      if (reviewsError) throw reviewsError;

      console.log(`✅ Revisión ${quarter}-${year} eliminada completamente`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando revisión:', error);
      return { success: false, error };
    }
  }

  // Crear nueva revisión (Beni)
  async createReview(data: {
    quarter: string;
    year: number;
    deadline_date?: string;
    created_by: string;
    centers: Array<{ id: number; name: string; items: any[] }>;
    notes?: string;
  }) {
    try {
      console.log('📋 Creando revisión trimestral de inventario...');
      
      // Primero eliminar cualquier revisión existente para este quarter/year
      console.log(`🗑️ Eliminando revisión existente ${data.quarter}-${data.year} si existe...`);
      await this.deleteReview(data.quarter, data.year);
      
      const reviews: QuarterlyReview[] = [];
      
      // Crear una revisión por cada centro
      for (const center of data.centers) {
        const reviewData: QuarterlyReview = {
          center_id: center.id,
          center_name: center.name,
          quarter: data.quarter,
          year: data.year,
          status: 'draft',
          deadline_date: data.deadline_date,
          created_by: data.created_by,
          total_items: center.items.length,
          total_discrepancies: 0,
          notes: data.notes
        };

        const { data: review, error } = await supabase
          .from('quarterly_reviews')
          .insert(reviewData)
          .select()
          .single();

        if (error) throw error;
        
        console.log(`✅ Revisión creada para ${center.name}:`, review.id);
        reviews.push(review);
      }

      return { success: true, reviews };
    } catch (error) {
      console.error('❌ Error creando revisión:', error);
      return { success: false, error };
    }
  }

  // Activar revisión y crear asignaciones (Beni)
  async activateReview(reviewId: number, encargadoEmail?: string) {
    try {
      console.log('🚀 Activando revisión:', reviewId);

      // 1. Actualizar status de la revisión
      const { data: review, error: reviewError } = await supabase
        .from('quarterly_reviews')
        .update({ 
          status: 'active',
          activated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (reviewError) throw reviewError;

      // 2. Crear asignación para el centro
      const assignmentData: QuarterlyReviewAssignment = {
        review_id: reviewId,
        center_id: review.center_id,
        center_name: review.center_name,
        assigned_to: encargadoEmail,
        status: 'pending'
      };

      const { data: assignment, error: assignmentError } = await supabase
        .from('quarterly_inventory_assignments')
        .insert(assignmentData)
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // 3. Enviar notificación al encargado
      if (encargadoEmail) {
        await this.sendNotification({
          review_id: reviewId,
          user_email: encargadoEmail,
          notification_type: 'review_assigned',
          message: `Nueva revisión trimestral de inventario asignada: ${review.quarter} - ${review.center_name}. Fecha límite: ${review.deadline_date || 'Sin definir'}`
        });
      }

      console.log('✅ Revisión activada y asignación creada');
      return { success: true, review, assignment };
    } catch (error) {
      console.error('❌ Error activando revisión:', error);
      return { success: false, error };
    }
  }

  // Obtener revisiones (Beni ve todas, Encargado solo las suyas)
  async getReviews(filters?: {
    center_id?: number;
    status?: string;
    quarter?: string;
    year?: number;
  }) {
    try {
      let query = supabase
        .from('quarterly_reviews')
        .select('*')
        .order('created_date', { ascending: false });

      if (filters?.center_id) {
        query = query.eq('center_id', filters.center_id);
      }
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

  // Obtener asignaciones de un encargado
  async getAssignments(centerId: number, status?: string) {
    try {
      console.log('🔍 Buscando asignaciones para centro:', centerId, 'con status:', status);
      
      let query = supabase
        .from('quarterly_inventory_assignments')
        .select(`
          *,
          review:quarterly_reviews(*)
        `)
        .eq('center_id', centerId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error en query:', error);
        throw error;
      }
      
      console.log('✅ Asignaciones encontradas:', data?.length || 0);
      console.log('📋 Datos:', data);
      
      return { success: true, assignments: data };
    } catch (error) {
      console.error('❌ Error obteniendo asignaciones:', error);
      return { success: false, error };
    }
  }

  // Guardar items de la revisión
  async saveReviewItems(assignmentId: number, items: QuarterlyReviewItem[]) {
    try {
      console.log('💾 Guardando items de revisión...');
      console.log('📋 Items a guardar:', items.length);
      console.log('📋 Primer item:', items[0]);

      // Verificar que la tabla existe y tiene las columnas correctas
      const { data: testData, error: testError } = await supabase
        .from('quarterly_review_items')
        .select('id, assignment_id, inventory_item_id')
        .limit(1);

      if (testError) {
        console.error('❌ Error verificando tabla:', testError);
        throw new Error(`Tabla quarterly_review_items no existe o no tiene las columnas correctas. Error: ${testError.message}`);
      }

      console.log('📋 Tabla verificada, primer registro:', testData?.[0] || 'Tabla vacía');

      const { data, error } = await supabase
        .from('quarterly_review_items')
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

  // Crear tabla quarterly_review_items si no existe
  async createReviewItemsTableIfNotExists() {
    try {
      console.log('🔧 Verificando/creando tabla quarterly_review_items...');

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS quarterly_review_items (
          id BIGSERIAL PRIMARY KEY,
          assignment_id BIGINT NOT NULL REFERENCES quarterly_inventory_assignments(id) ON DELETE CASCADE,
          inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id),
          product_name TEXT NOT NULL,
          category TEXT,
          current_system_quantity INTEGER NOT NULL DEFAULT 0,
          counted_quantity INTEGER DEFAULT 0,
          regular_quantity INTEGER DEFAULT 0,
          deteriorated_quantity INTEGER DEFAULT 0,
          to_remove_quantity INTEGER DEFAULT 0,
          observations TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(assignment_id, inventory_item_id)
        );
      `;

      const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

      if (error) {
        console.error('❌ Error creando tabla:', error);
        // Intentar ejecutar directamente con supabase
        const { error: directError } = await supabase.from('quarterly_review_items').select('id').limit(1);
        if (directError && directError.message.includes('does not exist')) {
          console.log('⚠️ Tabla no existe, intentando crear manualmente...');
          // Aquí podríamos mostrar un mensaje al usuario para que ejecute el SQL manualmente
          throw new Error('Tabla quarterly_review_items no existe. Ejecuta el script SQL create-quarterly-review-items-table.sql');
        }
      } else {
        console.log('✅ Tabla quarterly_review_items verificada/creada');

        // Crear índices
        const indexSQL = `
          CREATE INDEX IF NOT EXISTS idx_quarterly_review_items_assignment_id ON quarterly_review_items(assignment_id);
          CREATE INDEX IF NOT EXISTS idx_quarterly_review_items_inventory_item_id ON quarterly_review_items(inventory_item_id);
        `;

        await supabase.rpc('exec_sql', { sql: indexSQL });
      }
    } catch (error) {
      console.error('❌ Error en createReviewItemsTableIfNotExists:', error);
      throw error;
    }
  }

  // Completar revisión (Encargado)
  async completeAssignment(assignmentId: number, completedBy: string) {
    try {
      console.log('✅ Completando asignación:', assignmentId);

      const { data, error } = await supabase
        .from('quarterly_inventory_assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: completedBy
        })
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;

      // Notificar a Beni
      await this.sendNotification({
        review_id: data.review_id,
        user_email: 'beni.jungla@gmail.com', // Email de Beni
        notification_type: 'review_completed',
        message: `Revisión completada por ${completedBy} en ${data.center_name}`
      });

      return { success: true, assignment: data };
    } catch (error) {
      console.error('❌ Error completando asignación:', error);
      return { success: false, error };
    }
  }

  // Autorizar eliminación de items rotos (Beni solo autoriza, sistema elimina automáticamente)
  async authorizeItemRemoval(reviewId: number, authorizedBy: string) {
    try {
      console.log('🔍 Verificando items marcados para eliminar...');

      // 1. Obtener items marcados para eliminar
      const { data: items, error: itemsError } = await supabase
        .from('quarterly_review_items')
        .select('*')
        .gt('to_remove_quantity', 0);

      if (itemsError) throw itemsError;

      if (!items || items.length === 0) {
        return { 
          success: true, 
          message: 'No hay items marcados para eliminar',
          removedItems: []
        };
      }

      console.log(`📋 ${items.length} items marcados para eliminar`);

      // 2. AUTOMÁTICAMENTE actualizar cantidades en inventory_items
      const updates = items.map(async (item) => {
        const newQuantity = item.current_system_quantity - item.to_remove_quantity;
        
        console.log(`🗑️ ${item.product_name}: ${item.current_system_quantity} → ${newQuantity} (eliminando ${item.to_remove_quantity})`);
        
        return supabase
          .from('inventory_items')
          .update({ 
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.inventory_item_id);
      });

      await Promise.all(updates);

      // 3. Marcar revisión como completada
      await supabase
        .from('quarterly_reviews')
        .update({ 
          status: 'completed',
          approved_by: authorizedBy,
          approved_date: new Date().toISOString()
        })
        .eq('id', reviewId);

      console.log(`✅ ${items.length} items eliminados automáticamente del inventario`);
      
      return { 
        success: true, 
        message: `${items.length} items eliminados del inventario`,
        removedItems: items.map(i => ({
          name: i.product_name,
          removed: i.to_remove_quantity,
          newQuantity: i.current_system_quantity - i.to_remove_quantity
        }))
      };
    } catch (error) {
      console.error('❌ Error autorizando eliminación:', error);
      return { success: false, error };
    }
  }

  // Enviar notificación
  private async sendNotification(data: {
    review_id: number;
    user_email: string;
    notification_type: string;
    message: string;
  }) {
    try {
      const { error } = await supabase
        .from('review_notifications')
        .insert(data);

      if (error) throw error;
      console.log('📧 Notificación enviada a:', data.user_email);
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
    }
  }
}

export const quarterlyInventoryService = new QuarterlyInventoryService();
export default quarterlyInventoryService;
