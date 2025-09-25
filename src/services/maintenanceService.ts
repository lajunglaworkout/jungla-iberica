// =====================================================
// SERVICIO DE MANTENIMIENTO - SUPABASE INTEGRATION
// Gestión de inspecciones mensuales
// =====================================================

import type { 
  MaintenanceInspection, 
  MaintenanceInspectionItem,
  MaintenanceAlert,
  MaintenanceZone,
  MaintenanceConcept
} from '../types/maintenance';
import { MAINTENANCE_CALENDAR } from '../types/maintenance';

interface CreateInspectionData {
  inspection: Omit<MaintenanceInspection, 'id'>;
  items: MaintenanceInspectionItem[];
}

interface InspectionResponse {
  success: boolean;
  data?: MaintenanceInspection;
  error?: string;
}

interface InspectionListResponse {
  success: boolean;
  data?: MaintenanceInspection[];
  error?: string;
}

class MaintenanceService {
  
  // =====================================================
  // INTEGRAR CON CHECK-LIST PARA ITEMS CRÍTICOS
  // =====================================================
  private async integrateWithChecklist(inspection: MaintenanceInspection, items: MaintenanceInspectionItem[]): Promise<void> {
    try {
      const criticalItems = items.filter(item => item.is_critical_for_checklist);
      
      if (criticalItems.length === 0) {
        console.log('ℹ️ No hay items críticos para integrar con check-list');
        return;
      }

      const { supabase } = await import('../lib/supabase');
      
      // Crear items de check-list para problemas críticos
      const checklistItems = criticalItems.map(item => ({
        center_id: inspection.center_id,
        category: 'mantenimiento',
        subcategory: item.zone_name.toLowerCase(),
        description: `🚨 MANTENIMIENTO CRÍTICO: ${item.concept_name}`,
        details: `${item.observations}. Tarea: ${item.task_to_perform}`,
        priority: 'alta',
        requires_photo: true,
        maintenance_item_id: item.id,
        created_by: inspection.inspector_email,
        status: 'pendiente',
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('checklist_items')
        .insert(checklistItems);

      if (error) {
        console.error('❌ Error integrando con check-list:', error);
      } else {
        console.log(`✅ ${checklistItems.length} items críticos añadidos al check-list diario`);
      }

    } catch (error) {
      console.error('❌ Error en integrateWithChecklist:', error);
    }
  }

  // =====================================================
  // CREAR NUEVA INSPECCIÓN
  // =====================================================
  async createInspection(inspectionData: CreateInspectionData): Promise<InspectionResponse> {
    try {
      console.log('🔍 Creando nueva inspección...', inspectionData.inspection);
      
      const { supabase } = await import('../lib/supabase');
      
      // 1. Crear la inspección principal
      const { data: inspection, error: inspectionError } = await supabase
        .from('maintenance_inspections')
        .insert([inspectionData.inspection])
        .select()
        .single();

      if (inspectionError) {
        console.error('❌ Error creando inspección:', inspectionError);
        return { success: false, error: inspectionError.message };
      }

      console.log('✅ Inspección creada:', inspection.id);

      // 2. Crear los items de inspección
      const itemsWithInspectionId = inspectionData.items.map(item => ({
        ...item,
        inspection_id: inspection.id,
        id: undefined // Dejar que Supabase genere el UUID
      }));

      const { error: itemsError } = await supabase
        .from('maintenance_inspection_items')
        .insert(itemsWithInspectionId);

      if (itemsError) {
        console.error('❌ Error creando items:', itemsError);
        // Intentar limpiar la inspección creada
        await supabase
          .from('maintenance_inspections')
          .delete()
          .eq('id', inspection.id);
        
        return { success: false, error: itemsError.message };
      }

      console.log(`✅ ${itemsWithInspectionId.length} items de inspección creados`);

      // 3. Crear alertas para items críticos
      await this.createCriticalAlerts(inspection, inspectionData.items);

      // 4. Enviar notificaciones a Beni si hay items críticos
      await this.notifyBeniForCriticalItems(inspection, inspectionData.items);

      // 5. Integrar con check-list si hay items críticos
      await this.integrateWithChecklist(inspection, inspectionData.items);

      return { success: true, data: inspection };

    } catch (error) {
      console.error('❌ Error en createInspection:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  // =====================================================
  // OBTENER INSPECCIONES POR CENTRO
  // =====================================================
  async getInspectionsByCenter(centerId: string, limit: number = 10): Promise<InspectionListResponse> {
    try {
      console.log(`🔍 Obteniendo inspecciones para centro: ${centerId}`);
      
      const { supabase } = await import('../lib/supabase');
      
      const { data: inspections, error } = await supabase
        .from('maintenance_inspections')
        .select('*')
        .eq('center_id', centerId)
        .order('inspection_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error obteniendo inspecciones:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ ${inspections?.length || 0} inspecciones encontradas`);
      return { success: true, data: inspections || [] };

    } catch (error) {
      console.error('❌ Error en getInspectionsByCenter:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  // =====================================================
  // OBTENER ITEMS DE UNA INSPECCIÓN
  // =====================================================
  async getInspectionItems(inspectionId: string): Promise<{ success: boolean; data?: MaintenanceInspectionItem[]; error?: string }> {
    try {
      console.log(`🔍 Obteniendo items para inspección: ${inspectionId}`);
      
      const { supabase } = await import('../lib/supabase');
      
      const { data: items, error } = await supabase
        .from('maintenance_inspection_items')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('zone_name', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo items:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ ${items?.length || 0} items encontrados`);
      return { success: true, data: items || [] };

    } catch (error) {
      console.error('❌ Error en getInspectionItems:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  // =====================================================
  // VERIFICAR SI NECESITA INSPECCIÓN
  // =====================================================
  async needsInspection(centerId: string): Promise<{ needs: boolean; lastInspection?: MaintenanceInspection }> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const currentMonth = new Date().toISOString().substring(0, 7); // "2025-02"
      
      const { data: lastInspection, error } = await supabase
        .from('maintenance_inspections')
        .select('*')
        .eq('center_id', centerId)
        .eq('inspection_month', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Error verificando inspección:', error);
        return { needs: true };
      }

      const needs = !lastInspection;
      console.log(`🔍 Centro ${centerId} ${needs ? 'NECESITA' : 'NO NECESITA'} inspección este mes`);
      
      return { 
        needs, 
        lastInspection: lastInspection || undefined 
      };

    } catch (error) {
      console.error('❌ Error en needsInspection:', error);
      return { needs: true };
    }
  }

  // =====================================================
  // CREAR ALERTAS CRÍTICAS
  // =====================================================
  private async createCriticalAlerts(inspection: MaintenanceInspection, items: MaintenanceInspectionItem[]): Promise<void> {
    try {
      const criticalItems = items.filter(item => item.status === 'mal');
      
      if (criticalItems.length === 0) {
        console.log('ℹ️ No hay items críticos para crear alertas');
        return;
      }

      const { supabase } = await import('../lib/supabase');
      
      const alerts: Omit<MaintenanceAlert, 'id'>[] = criticalItems.map(item => ({
        type: 'critical_issue',
        center_id: inspection.center_id,
        center_name: inspection.center_name,
        title: `🚨 Estado crítico: ${item.concept_name}`,
        message: `${item.zone_name} - ${item.concept_name}: ${item.observations}. Tarea: ${item.task_to_perform}`,
        severity: 'critical',
        related_id: inspection.id,
        acknowledged: false,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('maintenance_alerts')
        .insert(alerts);

      if (error) {
        console.error('❌ Error creando alertas:', error);
      } else {
        console.log(`✅ ${alerts.length} alertas críticas creadas`);
      }

    } catch (error) {
      console.error('❌ Error en createCriticalAlerts:', error);
    }
  }

  // =====================================================
  // NOTIFICAR A BENI PARA ITEMS CRÍTICOS
  // =====================================================
  private async notifyBeniForCriticalItems(inspection: MaintenanceInspection, items: MaintenanceInspectionItem[]): Promise<void> {
    try {
      const criticalItems = items.filter(item => item.status === 'mal');
      
      if (criticalItems.length === 0) {
        console.log('ℹ️ No hay items críticos para notificar a Beni');
        return;
      }

      // Simular envío de email a Beni
      const emailContent = {
        to: MAINTENANCE_CALENDAR.beni_email,
        subject: `🚨 MANTENIMIENTO CRÍTICO - ${inspection.center_name}`,
        body: `
Hola Beni,

Se ha detectado ${criticalItems.length} problema(s) crítico(s) en la inspección mensual de ${inspection.center_name}:

${criticalItems.map(item => `
• ${item.zone_name} - ${item.concept_name}
  Estado: MAL
  Observaciones: ${item.observations}
  Tarea requerida: ${item.task_to_perform}
`).join('\n')}

Inspector: ${inspection.inspector_name}
Fecha: ${new Date(inspection.inspection_date).toLocaleDateString('es-ES')}
Puntuación general: ${inspection.overall_score}/100

Estos items aparecerán automáticamente en el check-list diario hasta su resolución.

Saludos,
Sistema de Mantenimiento La Jungla
        `
      };

      console.log('📧 Notificación enviada a Beni:', emailContent);
      
      // Aquí iría la integración real con servicio de email
      // await emailService.send(emailContent);

    } catch (error) {
      console.error('❌ Error notificando a Beni:', error);
    }
  }

  // =====================================================
  // OBTENER ZONAS Y CONCEPTOS
  // =====================================================
  async getZonesAndConcepts(): Promise<{ zones: MaintenanceZone[]; concepts: MaintenanceConcept[] }> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const [zonesResult, conceptsResult] = await Promise.all([
        supabase.from('maintenance_zones').select('*').order('name'),
        supabase.from('maintenance_concepts').select('*').order('zone_id, name')
      ]);

      const zones = zonesResult.data || [];
      const concepts = conceptsResult.data || [];

      console.log(`✅ Cargadas ${zones.length} zonas y ${concepts.length} conceptos desde Supabase`);
      
      return { zones, concepts };

    } catch (error) {
      console.error('❌ Error obteniendo zonas y conceptos:', error);
      // Fallback a datos hardcodeados
      const { MAINTENANCE_ZONES, MAINTENANCE_CONCEPTS } = await import('../types/maintenance');
      return { 
        zones: MAINTENANCE_ZONES, 
        concepts: MAINTENANCE_CONCEPTS 
      };
    }
  }

  // =====================================================
  // OBTENER ESTADÍSTICAS DE MANTENIMIENTO
  // =====================================================
  async getMaintenanceStats(centerId?: string): Promise<{
    totalInspections: number;
    averageScore: number;
    criticalIssues: number;
    pendingTasks: number;
  }> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      let query = supabase.from('maintenance_inspections').select('*');
      if (centerId) {
        query = query.eq('center_id', centerId);
      }

      const { data: inspections, error } = await query;

      if (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        return { totalInspections: 0, averageScore: 0, criticalIssues: 0, pendingTasks: 0 };
      }

      const totalInspections = inspections?.length || 0;
      const averageScore = totalInspections > 0 
        ? Math.round(inspections.reduce((sum, i) => sum + i.overall_score, 0) / totalInspections)
        : 0;
      const criticalIssues = inspections?.reduce((sum, i) => sum + i.items_bad, 0) || 0;

      // Obtener tareas pendientes
      let tasksQuery = supabase
        .from('maintenance_inspection_items')
        .select('*')
        .neq('task_status', 'completada');
      
      if (centerId) {
        // Necesitaríamos join con inspections para filtrar por centro
        // Por simplicidad, usamos el conteo de items_regular + items_bad
        const pendingTasks = inspections?.reduce((sum, i) => sum + i.items_regular + i.items_bad, 0) || 0;
        
        return {
          totalInspections,
          averageScore,
          criticalIssues,
          pendingTasks
        };
      }

      const { data: tasks } = await tasksQuery;
      const pendingTasks = tasks?.length || 0;

      return {
        totalInspections,
        averageScore,
        criticalIssues,
        pendingTasks
      };

    } catch (error) {
      console.error('❌ Error en getMaintenanceStats:', error);
      return { totalInspections: 0, averageScore: 0, criticalIssues: 0, pendingTasks: 0 };
    }
  }


  // =====================================================
  // SUBIR FOTO DE MANTENIMIENTO
  // =====================================================
  async uploadMaintenancePhoto(file: File, itemId: string, type: 'deterioro' | 'reparacion'): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      // Generar nombre único para la foto
      const fileExt = file.name.split('.').pop();
      const fileName = `${itemId}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `maintenance/${fileName}`;

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('maintenance-photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Error subiendo foto:', uploadError);
        return { success: false, error: uploadError.message };
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('maintenance-photos')
        .getPublicUrl(filePath);

      const photoUrl = urlData.publicUrl;

      // Actualizar item con la nueva foto
      const { data: currentItem, error: fetchError } = await supabase
        .from('maintenance_inspection_items')
        .select('photos_deterioro, photos_reparacion')
        .eq('id', itemId)
        .single();

      if (fetchError) {
        console.error('❌ Error obteniendo item actual:', fetchError);
        return { success: false, error: fetchError.message };
      }

      const updatedPhotos = type === 'deterioro' 
        ? [...(currentItem.photos_deterioro || []), photoUrl]
        : [...(currentItem.photos_reparacion || []), photoUrl];

      const updateField = type === 'deterioro' ? 'photos_deterioro' : 'photos_reparacion';
      const updateData: any = {
        [updateField]: updatedPhotos,
        updated_at: new Date().toISOString()
      };

      // Si es foto de reparación, permitir cerrar tarea
      if (type === 'reparacion') {
        updateData.can_close_task = true;
      }

      const { error: updateError } = await supabase
        .from('maintenance_inspection_items')
        .update(updateData)
        .eq('id', itemId);

      if (updateError) {
        console.error('❌ Error actualizando item con foto:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log(`✅ Foto de ${type} subida correctamente: ${photoUrl}`);
      return { success: true, url: photoUrl };

    } catch (error) {
      console.error('❌ Error en uploadMaintenancePhoto:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  // =====================================================
  // ACTUALIZAR ESTADO DE TAREA
  // =====================================================
  async updateTaskStatus(
    itemId: string, 
    status: 'pendiente' | 'en_progreso' | 'completada',
    repairPhotos?: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const updateData: any = {
        task_status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completada') {
        updateData.completed_date = new Date().toISOString().split('T')[0];
        updateData.can_close_task = true;
      }

      if (repairPhotos && repairPhotos.length > 0) {
        updateData.photos_reparacion = repairPhotos;
        updateData.can_close_task = true;
      }

      const { error } = await supabase
        .from('maintenance_inspection_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) {
        console.error('❌ Error actualizando tarea:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Tarea ${itemId} actualizada a estado: ${status}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error en updateTaskStatus:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }
}

// Exportar instancia singleton
export const maintenanceService = new MaintenanceService();
export default maintenanceService;
