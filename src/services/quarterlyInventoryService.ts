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

// Decisión de Beni por cada ítem con discrepancia
export interface ReviewDecision {
  item_id: number;                   // ID del quarterly_review_item
  inventory_item_id: number;         // ID en inventory_items
  product_name: string;
  category?: string;
  current_system_quantity: number;
  counted_quantity: number;
  regular_quantity: number;
  deteriorated_quantity: number;
  actions: {
    darDeBaja: boolean;              // Restar rotos del inventario
    enviarAPedido: boolean;          // Añadir al pedido post-revisión
    marcarRegular: boolean;          // Flagear en inventario como 'regular'
  };
  quantities: {
    broken: number;                  // Unidades rotas a dar de baja
    missing: number;                 // Unidades faltantes (sistema - contadas)
    regular: number;                 // Unidades en estado regular
    toOrder: number;                 // Cantidad total a pedir (rotos + faltantes seleccionados)
  };
}

class QuarterlyInventoryService {

  // Eliminar revisión completa (Beni)
  async deleteReview(quarter: string, year: number) {
    try {
      console.log(`🗑️ Eliminando revisión ${quarter}-${year}...`);

      // 1. Obtener IDs de las revisiones a eliminar
      const { data: reviews, error: reviewsError } = await supabase
        .from('quarterly_reviews')
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
        .from('quarterly_inventory_assignments')
        .select('id')
        .in('review_id', reviewIds);

      if (assignments && assignments.length > 0) {
        const assignmentIds = assignments.map(a => a.id);
        console.log('📋 IDs de asignaciones a eliminar:', assignmentIds);

        // 3. Eliminar items de revisión
        const { error: itemsError } = await supabase
          .from('quarterly_review_items')
          .delete()
          .in('assignment_id', assignmentIds);

        if (itemsError) {
          console.error('❌ Error eliminando items:', itemsError);
        } else {
          console.log('✅ Items de revisión eliminados');
        }

        // 4. Eliminar asignaciones
        const { error: assignmentsDeleteError } = await supabase
          .from('quarterly_inventory_assignments')
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
        .from('quarterly_reviews')
        .delete()
        .in('id', reviewIds);

      if (reviewsDeleteError) {
        console.error('❌ Error eliminando revisiones:', reviewsDeleteError);
        return { success: false, error: reviewsDeleteError };
      }

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



  // Completar revisión (Encargado) -> Pasa a estado 'submitted'
  async completeAssignment(assignmentId: number, completedBy: string) {
    try {
      console.log('✅ Completando asignación:', assignmentId);

      // 1. Obtener datos de la asignación y revisión
      const { data: assignmentData, error: fetchError } = await supabase
        .from('quarterly_inventory_assignments')
        .select('*, review:quarterly_reviews(*)')
        .eq('id', assignmentId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Completar la asignación (Encargado ha terminado)
      const { data: assignment, error: errorUpdate } = await supabase
        .from('quarterly_inventory_assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: completedBy
        })
        .eq('id', assignmentId)
        .select()
        .single();

      if (errorUpdate) throw errorUpdate;

      // 3. Actualizar estado de la revisión a 'submitted' (Enviada a Beni)
      const { error: reviewError } = await supabase
        .from('quarterly_reviews')
        .update({
          status: 'submitted'
        })
        .eq('id', assignmentData.review_id);

      if (reviewError) {
        console.error('⚠️ Error actualizando status de revisión a submitted:', reviewError);
      }

      // 4. Calcular resumen para notificaciones
      // Obtener items para contar discrepancias
      const { data: items } = await supabase
        .from('quarterly_review_items')
        .select('*')
        .eq('assignment_id', assignmentId);

      const totalItems = items?.length || 0;
      const discrepancies = items?.filter(i => {
        const total = (i.counted_quantity || 0) + (i.regular_state_quantity || 0) + (i.deteriorated_quantity || 0);
        return total !== i.current_system_quantity;
      }).length || 0;

      // 5. Notificar a Beni (Logística)
      await this.sendNotification({
        review_id: assignmentData.review_id,
        user_email: 'beni.jungla@gmail.com',
        notification_type: 'review_submitted',
        message: `📢 Revisión ${assignmentData.review.quarter} de ${assignmentData.center_name} ENVIADA por ${completedBy}.\n${totalItems} productos contabilizados. ${discrepancies} discrepancias.`
      });

      // 6. Notificar a Carlos (CEO/Admin)
      // Usamos un email genérico o de admin si no tenemos el específico
      await this.sendNotification({
        review_id: assignmentData.review_id,
        user_email: 'carlossuarezparra@gmail.com', // Placeholder dirección
        notification_type: 'review_submitted',
        message: `📢 Revisión ${assignmentData.review.quarter} de ${assignmentData.center_name} completada por encargado.`
      });

      return { success: true, assignment };
    } catch (error) {
      console.error('❌ Error completando asignación:', error);
      return { success: false, error };
    }
  }

  // APLICAR CAMBIOS DE LA REVISIÓN (Beni)
  // Esta función es la CRÍTICA. Actualiza el inventario real y cierra la revisión.
  async applyReviewChanges(reviewId: number, itemsToApply: any[], appliedBy: string) {
    try {
      console.log(`🚀 Aplicando ${itemsToApply.length} cambios de revisión ${reviewId}...`);

      const changesSummary = {
        updated: 0,
        movements: 0,
        broken: 0,
        lost: 0,
        found: 0,
        value_lost: 0
      };

      // 1. Procesar cada item seleccionado
      for (const item of itemsToApply) {
        // Calcular cantidades
        const currentSystem = item.current_system_quantity; // Lo que el sistema pensaba que había

        // NUEVA LÓGICA: counted_quantity es el TOTAL FÍSICO presente en el centro
        const totalPhysical = item.counted_quantity || 0;

        // Subconjuntos (informacion de estado)
        const brokenQuantity = item.deteriorated_quantity || 0;

        // La cantidad "Válida" que quedará en stock tras tirar lo roto
        // Si hay 16 contados y 4 rotos -> Quedan 12 buenos.
        const newValidQuantity = totalPhysical - brokenQuantity;

        if (newValidQuantity < 0) {
          console.error(`❌ Error lógico en item ${item.product_name}: Rotos (${brokenQuantity}) > Total (${totalPhysical})`);
          continue; // Skip seguridad
        }
        const discrepancy = totalPhysical - currentSystem; // -2 me falta, +2 me sobra

        // Acciones:
        // A. Ajuste de inventario (por pérdida/ganancia inexplicable)
        if (discrepancy !== 0) {
          await supabase.from('inventory_movements').insert({
            inventory_item_id: item.inventory_item_id,
            type: discrepancy < 0 ? 'adjustment_loss' : 'adjustment_gain',
            quantity_change: discrepancy,
            previous_quantity: currentSystem,
            new_quantity: currentSystem + discrepancy,
            reason: `Revisión Trimestral: ${discrepancy < 0 ? 'Pérdida' : 'Excedente'} detectado (por ${appliedBy})`
          });

          if (discrepancy < 0) changesSummary.lost += Math.abs(discrepancy);
          else changesSummary.found += discrepancy;

          changesSummary.movements++;
        }

        // B. Baja por rotura (si hay items rotos)
        if (brokenQuantity > 0) {
          // El sistema "tenía" (System + Discrepancy) = TotalPhysical.
          // Ahora bajamos los rotos.
          await supabase.from('inventory_movements').insert({
            inventory_item_id: item.inventory_item_id,
            type: 'breakage',
            quantity_change: -(brokenQuantity),
            previous_quantity: totalPhysical,
            new_quantity: newValidQuantity,
            reason: `Revisión Trimestral: Baja por deterioro/rotura (por ${appliedBy})`
          });
          changesSummary.broken += brokenQuantity;
          changesSummary.movements++;
        }

        // C. Actualización FINAL del item en inventory_items
        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({
            cantidad_actual: newValidQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.inventory_item_id);

        if (updateError) {
          console.error(`❌ Error actualizando item ${item.product_name}:`, updateError);
        } else {
          changesSummary.updated++;
        }
      }

      // 2. Marcar revisión como COMPLETADA y APLICADA
      await supabase
        .from('quarterly_reviews')
        .update({
          status: 'completed', // Fin del ciclo
          approved_by: appliedBy,
          approved_date: new Date().toISOString(),
          notes: `Aplicados ${changesSummary.updated} cambios. Rotos: ${changesSummary.broken}, Perdidos: ${changesSummary.lost}.`
        })
        .eq('id', reviewId);

      // 3. Notificación final a Carlos (CEO) con el resumen financiero (placeholder)
      const summaryMsg = `🏁 Revisión APLICADA. Cambios: ${changesSummary.updated}. Roturas: ${changesSummary.broken}. Extravíos: ${changesSummary.lost}.`;

      await this.sendNotification({
        review_id: reviewId,
        user_email: 'carlossuarezparra@gmail.com',
        notification_type: 'review_applied',
        message: summaryMsg
      });

      console.log('✅ Revisión aplicada con éxito:', changesSummary);
      return { success: true, summary: changesSummary };

    } catch (error) {
      console.error('❌ Error aplicando cambios de revisión:', error);
      return { success: false, error };
    }
  }

  // NUEVO: Procesar decisiones de Beni sobre la revisión
  // Este método reemplaza applyReviewChanges con un flujo de decisiones por ítem
  async processReviewDecisions(
    reviewId: number,
    centerName: string,
    quarter: string,
    decisions: ReviewDecision[],
    processedBy: string
  ) {
    try {
      console.log(`🚀 Procesando ${decisions.length} decisiones para revisión ${reviewId}...`);

      const summary = {
        bajas: 0,             // Items dados de baja (rotos restados)
        bajasUnidades: 0,     // Total unidades rotas retiradas
        regulares: 0,         // Items marcados como regular
        faltantes: 0,         // Items con faltante de stock
        faltantesUnidades: 0, // Total unidades faltantes
        pedidoItems: 0,       // Items añadidos al pedido
        pedidoUnidades: 0,    // Total unidades a pedir
        inventarioActualizado: 0,
        movimientos: 0,
      };

      // ================================================
      // 1. PROCESAR CADA DECISIÓN
      // ================================================
      for (const decision of decisions) {
        const {
          inventory_item_id,
          product_name,
          current_system_quantity,
          counted_quantity,
          actions,
          quantities
        } = decision;

        const totalPhysical = counted_quantity || 0;
        const discrepancy = totalPhysical - current_system_quantity;

        // A. DAR DE BAJA (restar rotos del inventario)
        if (actions.darDeBaja && quantities.broken > 0) {
          // Registrar movimiento de rotura
          await supabase.from('inventory_movements').insert({
            inventory_item_id: inventory_item_id,
            type: 'breakage',
            quantity_change: -(quantities.broken),
            previous_quantity: totalPhysical,
            new_quantity: totalPhysical - quantities.broken,
            reason: `Revisión Trimestral ${quarter}: Baja por rotura/deterioro (por ${processedBy})`
          });

          summary.bajas++;
          summary.bajasUnidades += quantities.broken;
          summary.movimientos++;
        }

        // B. REGISTRAR FALTANTES (ajuste de pérdida)
        if (discrepancy < 0) {
          await supabase.from('inventory_movements').insert({
            inventory_item_id: inventory_item_id,
            type: 'adjustment_loss',
            quantity_change: discrepancy,
            previous_quantity: current_system_quantity,
            new_quantity: totalPhysical,
            reason: `Revisión Trimestral ${quarter}: ${Math.abs(discrepancy)} unidades faltantes (por ${processedBy})`
          });

          summary.faltantes++;
          summary.faltantesUnidades += Math.abs(discrepancy);
          summary.movimientos++;
        } else if (discrepancy > 0) {
          // Excedente encontrado
          await supabase.from('inventory_movements').insert({
            inventory_item_id: inventory_item_id,
            type: 'adjustment_gain',
            quantity_change: discrepancy,
            previous_quantity: current_system_quantity,
            new_quantity: totalPhysical,
            reason: `Revisión Trimestral ${quarter}: ${discrepancy} unidades de más encontradas (por ${processedBy})`
          });
          summary.movimientos++;
        }

        // C. ACTUALIZAR INVENTARIO
        const newQuantity = totalPhysical - (actions.darDeBaja ? quantities.broken : 0);

        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({
            cantidad_actual: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', inventory_item_id);

        if (!updateError) {
          summary.inventarioActualizado++;
          if (actions.marcarRegular) summary.regulares++;
        } else {
          console.error(`❌ Error actualizando ${product_name}:`, updateError);
        }

        // D. CONTABILIZAR PARA PEDIDO
        if (actions.enviarAPedido && quantities.toOrder > 0) {
          summary.pedidoItems++;
          summary.pedidoUnidades += quantities.toOrder;
        }
      }

      // ================================================
      // 2. GENERAR PEDIDO POST-REVISIÓN (si hay items)
      // ================================================
      let orderId: string | null = null;

      const itemsForOrder = decisions.filter(d => d.actions.enviarAPedido && d.quantities.toOrder > 0);

      if (itemsForOrder.length > 0) {
        const orderIdStr = `REV-${quarter.replace(/\s/g, '')}-${centerName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

        // Construir notas con detalle de items
        const itemsDetail = itemsForOrder.map(d =>
          `• ${d.product_name}: ${d.quantities.toOrder} uds (${d.quantities.broken > 0 ? `Rotos: ${d.quantities.broken}` : ''}${d.quantities.missing > 0 ? ` Faltantes: ${d.quantities.missing}` : ''})`.trim()
        ).join('\n');

        // Insertar pedido en Supabase
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            id: orderIdStr,
            type: 'review_order',
            from_location: centerName,
            to_location: 'Proveedor',
            order_date: new Date().toISOString().split('T')[0],
            status: 'pending',
            amount: 0,
            created_by: `${processedBy} - Revisión ${quarter}`,
            notes: `📋 Pedido Post-Revisión ${quarter} - ${centerName} (Revisión #${reviewId})\n${itemsForOrder.length} productos:\n${itemsDetail}`
          });

        if (orderError) {
          console.error('❌ Error creando pedido post-revisión:', orderError);
          // No fail completo, seguimos con el resto
        } else {
          orderId = orderIdStr;
          console.log(`📦 Pedido post-revisión creado: ${orderIdStr}`);
        }
      }

      // ================================================
      // 3. MARCAR REVISIÓN COMO COMPLETADA
      // ================================================
      await supabase
        .from('quarterly_reviews')
        .update({
          status: 'completed',
          approved_by: processedBy,
          approved_date: new Date().toISOString(),
          notes: [
            `✅ Procesado por ${processedBy}`,
            `Bajas: ${summary.bajasUnidades} uds (${summary.bajas} productos)`,
            `Faltantes: ${summary.faltantesUnidades} uds (${summary.faltantes} productos)`,
            `Regular: ${summary.regulares} productos marcados`,
            orderId ? `Pedido: ${orderId} (${summary.pedidoUnidades} uds)` : 'Sin pedido generado'
          ].join(' | ')
        })
        .eq('id', reviewId);

      // ================================================
      // 4. NOTIFICACIÓN A CARLOS (CEO)
      // ================================================
      const summaryMsg = [
        `🏁 Revisión ${quarter} ${centerName} PROCESADA por ${processedBy}.`,
        `📊 Bajas: ${summary.bajasUnidades} uds | Faltantes: ${summary.faltantesUnidades} uds | Regular: ${summary.regulares} items`,
        orderId ? `🛒 Pedido ${orderId} generado con ${summary.pedidoUnidades} uds.` : ''
      ].filter(Boolean).join('\n');

      await this.sendNotification({
        review_id: reviewId,
        user_email: 'carlossuarezparra@gmail.com',
        notification_type: 'review_applied',
        message: summaryMsg
      });

      console.log('✅ Revisión procesada con éxito:', summary);
      return {
        success: true,
        summary,
        orderId
      };

    } catch (error) {
      console.error('❌ Error procesando decisiones de revisión:', error);
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
        .from('notifications') // Corregido: tabla unificada
        .insert({
          recipient_email: data.user_email,
          type: data.notification_type,
          title: 'Gestión de Inventario', // Título genérico o derivado
          message: data.message,
          reference_type: 'quarterly_review',
          reference_id: data.review_id.toString(),
          link: 'logistics-quarterly', // Special link for navigation handler
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

export const quarterlyInventoryService = new QuarterlyInventoryService();
export default quarterlyInventoryService;
