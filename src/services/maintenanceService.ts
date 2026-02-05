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
  // INICIAR INSPECCIÓN (MARCAR COMO EN PROGRESO)
  // =====================================================
  async startInspection(centerId: string, inspectorName: string): Promise<{ success: boolean; inspectionId?: string; error?: string }> {
    try {
      const { supabase } = await import('../lib/supabase');

      // Verificar si ya existe una inspección para este mes/trimestre
      const today = new Date();
      const currentMonthStr = today.toISOString().substring(0, 7);

      const { data: existing } = await supabase
        .from('maintenance_inspections')
        .select('id, status')
        .eq('center_id', centerId)
        .eq('inspection_month', currentMonthStr)
        .single();

      if (existing) {
        // Si ya existe y está completada, no hacemos nada
        if (existing.status === 'completed' || existing.status === 'reviewed') {
          return { success: true, inspectionId: existing.id };
        }

        // Verificar si tiene items creados
        const { count } = await supabase
          .from('maintenance_inspection_items')
          .select('*', { count: 'exact', head: true })
          .eq('inspection_id', existing.id);

        // Si no tiene items (migración/fix), crearlos
        if (count === 0) {
          const { MAINTENANCE_ZONES, MAINTENANCE_CONCEPTS } = await import('../types/maintenance');
          const initialItems = [];
          for (const zone of MAINTENANCE_ZONES) {
            const zoneConcepts = MAINTENANCE_CONCEPTS.filter(c => c.zone_id === zone.id);
            for (const concept of zoneConcepts) {
              initialItems.push({
                inspection_id: existing.id,
                zone_id: zone.id,
                zone_name: zone.name,
                concept_id: concept.id,
                concept_name: concept.name,
                status: 'bien',
                observations: '',
                task_to_perform: '',
                task_priority: 'baja',
                photos_deterioro: [],
                photos_reparacion: [],
                photos_required: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }
          await supabase.from('maintenance_inspection_items').insert(initialItems);
        }

        // Si está en borrador o progreso, actualizamos timestamp
        const { error: updateError } = await supabase
          .from('maintenance_inspections')
          .update({
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
        return { success: true, inspectionId: existing.id };
      }

      // Si no existe, creamos nueva
      const newInspection: Partial<MaintenanceInspection> = {
        id: crypto.randomUUID(),
        center_id: centerId,
        center_name: '', // Se llenará con join o trigger
        inspector_name: inspectorName,
        inspection_date: today.toISOString(),
        inspection_month: currentMonthStr,
        inspection_year: today.getFullYear(),
        status: 'in_progress',
        total_items: 0,
        items_ok: 0,
        items_regular: 0,
        items_bad: 0,
        overall_score: 0,
        notes: '',
        created_at: today.toISOString(),
        updated_at: today.toISOString()
      };

      // Obtener nombre del centro (opcional, para integridad)
      const { data: centerData } = await supabase
        .from('centers')
        .select('name')
        .eq('id', centerId)
        .single();

      if (centerData) {
        newInspection.center_name = centerData.name;
      }

      const { error: insertError } = await supabase
        .from('maintenance_inspections')
        .insert(newInspection);

      if (insertError) throw insertError;

      // CREAR ITEMS VACÍOS PARA LA INSPECCIÓN
      const { MAINTENANCE_ZONES, MAINTENANCE_CONCEPTS } = await import('../types/maintenance');

      const initialItems = [];
      for (const zone of MAINTENANCE_ZONES) {
        const zoneConcepts = MAINTENANCE_CONCEPTS.filter(c => c.zone_id === zone.id);
        for (const concept of zoneConcepts) {
          initialItems.push({
            inspection_id: newInspection.id,
            zone_id: zone.id,
            zone_name: zone.name,
            concept_id: concept.id,
            concept_name: concept.name,
            status: 'bien',
            observations: '',
            task_to_perform: '',
            task_priority: 'baja',
            photos_deterioro: [],
            photos_reparacion: [],
            photos_required: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }

      const { error: itemsError } = await supabase
        .from('maintenance_inspection_items')
        .insert(initialItems);

      if (itemsError) {
        console.error('❌ Error creando items iniciales:', itemsError);
        // No fallamos completamente, pero logueamos
      }

      return { success: true, inspectionId: newInspection.id };

    } catch (error) {
      console.error('❌ Error en startInspection:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  // =====================================================
  // ACTUALIZAR PROGRESO DE UN ITEM
  // =====================================================
  async updateInspectionItemProgress(itemId: string, updates: Partial<MaintenanceInspectionItem>): Promise<{ success: boolean; error?: string }> {
    try {
      const { supabase } = await import('../lib/supabase');

      const { error } = await supabase
        .from('maintenance_inspection_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Error en updateInspectionItemProgress:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  // =====================================================
  // COMPLETAR INSPECCIÓN
  // =====================================================
  async completeInspection(inspectionId: string, summaryData: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { supabase } = await import('../lib/supabase');

      // 1. Actualizar la inspección principal
      const { data: inspection, error: updateError } = await supabase
        .from('maintenance_inspections')
        .update({
          ...summaryData,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', inspectionId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 2. Obtener todos los items para procesar alertas
      const { data: items } = await supabase
        .from('maintenance_inspection_items')
        .select('*')
        .eq('inspection_id', inspectionId);

      if (items) {
        // 3. Crear alertas para items críticos
        await this.createCriticalAlerts(inspection, items);

        // 4. Enviar notificaciones a Beni si hay items críticos
        await this.notifyBeniForCriticalItems(inspection, items);

        // 5. Integrar con check-list si hay items críticos
        await this.integrateWithChecklist(inspection, items);
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Error en completeInspection:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  // =====================================================
  // CREAR NUEVA INSPECCIÓN (Legacy / Fallback)
  // =====================================================
  async createInspection(inspectionData: CreateInspectionData): Promise<InspectionResponse> {
    try {
      console.log('🔍 Creando nueva inspección...', inspectionData.inspection);
      // ... (mantener código anterior si es necesario, o redirigir)
      // Por ahora mantenemos la implementación anterior por compatibilidad
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
  // =====================================================
  // OBTENER ESTADÍSTICAS PARA DIRECTOR
  // =====================================================
  async getDirectorStats(): Promise<{
    totalActiveTickets: number;
    avgResolutionTime: number; // en días
    criticalIssuesCount: number;
    totalInspectionsThisMonth: number;
  }> {
    try {
      const { supabase } = await import('../lib/supabase');

      // 1. Tickets activos from maintenance_inspection_items (original)
      const { count: inspectionActiveTickets } = await supabase
        .from('maintenance_inspection_items')
        .select('*', { count: 'exact', head: true })
        .neq('task_status', 'completada')
        .neq('status', 'bien'); // Solo contar items que no están bien

      // 1b. Also count active incidents from checklist_incidents with department=Mantenimiento
      const { count: checklistActiveTickets } = await supabase
        .from('checklist_incidents')
        .select('*', { count: 'exact', head: true })
        .or('incident_type.eq.maintenance,department.eq.Mantenimiento')
        .neq('status', 'resuelta');

      const totalActiveTickets = (inspectionActiveTickets || 0) + (checklistActiveTickets || 0);

      // 2. Tiempo medio de resolución (de tickets completados este mes)
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);

      const { data: completedTickets } = await supabase
        .from('maintenance_inspection_items')
        .select('created_at, completed_date')
        .eq('task_status', 'completada')
        .gte('completed_date', currentMonthStart.toISOString());

      let avgResolutionTime = 0;
      if (completedTickets && completedTickets.length > 0) {
        const totalDays = completedTickets.reduce((sum, ticket) => {
          const start = new Date(ticket.created_at);
          const end = new Date(ticket.completed_date);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0);
        avgResolutionTime = Math.round((totalDays / completedTickets.length) * 10) / 10;
      }

      // 3. Problemas críticos actuales (from both sources)
      const { count: criticalFromInspections } = await supabase
        .from('maintenance_inspection_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'mal')
        .neq('task_status', 'completada');

      const { count: criticalFromChecklist } = await supabase
        .from('checklist_incidents')
        .select('*', { count: 'exact', head: true })
        .or('incident_type.eq.maintenance,department.eq.Mantenimiento')
        .in('priority', ['critica', 'alta'])
        .neq('status', 'resuelta');

      const criticalIssuesCount = (criticalFromInspections || 0) + (criticalFromChecklist || 0);

      // 4. Inspecciones este mes
      const currentMonthStr = new Date().toISOString().substring(0, 7);
      const { count: inspectionsThisMonth } = await supabase
        .from('maintenance_inspections')
        .select('*', { count: 'exact', head: true })
        .eq('inspection_month', currentMonthStr);

      return {
        totalActiveTickets,
        avgResolutionTime,
        criticalIssuesCount,
        totalInspectionsThisMonth: inspectionsThisMonth || 0
      };

    } catch (error) {
      console.error('❌ Error en getDirectorStats:', error);
      return {
        totalActiveTickets: 0,
        avgResolutionTime: 0,
        criticalIssuesCount: 0,
        totalInspectionsThisMonth: 0
      };
    }
  }

  // =====================================================
  // OBTENER COMPARATIVA DE CENTROS
  // =====================================================
  async getCenterComparison(): Promise<Array<{
    centerId: string;
    centerName: string;
    healthScore: number;
    pendingTickets: number;
    lastInspectionDate: string | null;
  }>> {
    try {
      const { supabase } = await import('../lib/supabase');

      // Obtener última inspección de cada centro
      const { data: inspections } = await supabase
        .from('maintenance_inspections')
        .select('center_id, center_name, overall_score, inspection_date, items_regular, items_bad')
        .order('inspection_date', { ascending: false });

      // Agrupar por centro (tomando la más reciente)
      const centerMap = new Map();

      inspections?.forEach(inspection => {
        if (!centerMap.has(inspection.center_id)) {
          centerMap.set(inspection.center_id, {
            centerId: inspection.center_id,
            centerName: inspection.center_name,
            healthScore: inspection.overall_score,
            pendingTickets: inspection.items_regular + inspection.items_bad, // Aproximación
            lastInspectionDate: inspection.inspection_date
          });
        }
      });

      // Si no hay inspecciones, obtener lista base de centros de la BD
      if (centerMap.size === 0) {
        const centers = await this.getCenters();
        return centers.map(c => ({
          centerId: c.id.toString(),
          centerName: c.name,
          healthScore: 0,
          pendingTickets: 0,
          lastInspectionDate: null
        }));
      }

      return Array.from(centerMap.values());

    } catch (error) {
      console.error('❌ Error en getCenterComparison:', error);
      return [];
    }
  }

  // =====================================================
  // OBTENER REPARACIONES FRECUENTES
  // =====================================================
  async getFrequentRepairs(): Promise<Array<{
    conceptName: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    try {
      const { supabase } = await import('../lib/supabase');

      // Obtener items que no están "bien" de los últimos 3 meses
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: items } = await supabase
        .from('maintenance_inspection_items')
        .select('concept_name, created_at')
        .neq('status', 'bien')
        .gte('created_at', threeMonthsAgo.toISOString());

      if (!items || items.length === 0) return [];

      // Contar ocurrencias
      const counts: Record<string, number> = {};
      items.forEach(item => {
        counts[item.concept_name] = (counts[item.concept_name] || 0) + 1;
      });

      // Convertir a array y ordenar
      return Object.entries(counts)
        .map(([name, count]) => ({
          conceptName: name,
          count,
          trend: 'stable' as 'up' | 'down' | 'stable' // Simplificado por ahora
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5

    } catch (error) {
      console.error('❌ Error en getFrequentRepairs:', error);
      return [];
    }
  }

  // =====================================================
  // OBTENER REPARACIONES SIN GESTIONAR (STALE)
  // =====================================================
  async getUnmanagedRepairs(): Promise<Array<{
    id: string;
    centerName: string;
    conceptName: string;
    daysOpen: number;
    status: string;
  }>> {
    try {
      const { supabase } = await import('../lib/supabase');

      // Tickets abiertos hace más de 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: items } = await supabase
        .from('maintenance_inspection_items')
        .select(`
          id,
          concept_name,
          created_at,
          status,
          maintenance_inspections (
            center_name
          )
        `)
        .neq('task_status', 'completada')
        .neq('status', 'bien')
        .lte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true })
        .limit(10);

      if (!items) return [];

      return items.map((item: any) => {
        const created = new Date(item.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - created.getTime());
        const daysOpen = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          id: item.id,
          centerName: item.maintenance_inspections?.center_name || 'Desconocido',
          conceptName: item.concept_name,
          daysOpen,
          status: item.status
        };
      });

    } catch (error) {
      console.error('❌ Error en getUnmanagedRepairs:', error);
      return [];
    }
  }
  // =====================================================
  // OBTENER TODAS LAS INSPECCIONES (HISTÓRICO)
  // =====================================================
  async getAllInspections(
    filters?: { centerId?: string; startDate?: string; endDate?: string },
    limit: number = 50
  ): Promise<InspectionListResponse> {
    try {
      const { supabase } = await import('../lib/supabase');

      let query = supabase
        .from('maintenance_inspections')
        .select('*')
        .order('inspection_date', { ascending: false })
        .limit(limit);

      if (filters?.centerId) {
        query = query.eq('center_id', filters.centerId);
      }
      if (filters?.startDate) {
        query = query.gte('inspection_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('inspection_date', filters.endDate);
      }

      const { data: inspections, error } = await query;

      if (error) {
        console.error('❌ Error obteniendo histórico de inspecciones:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: inspections || [] };

    } catch (error) {
      console.error('❌ Error en getAllInspections:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  // =====================================================
  // OBTENER TODOS LOS CENTROS
  // =====================================================
  async getCenters(): Promise<Array<{ id: string; name: string }>> {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: centers, error } = await supabase
        .from('centers')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('❌ Error obteniendo centros:', error);
        return [];
      }

      return centers || [];
    } catch (error) {
      console.error('❌ Error en getCenters:', error);
      return [];
    }
  }

  // =====================================================
  // OBTENER CALENDARIO DE INSPECCIONES (CONVOCATORIA)
  // =====================================================
  async getInspectionSchedule(): Promise<Array<{
    centerId: string;
    centerName: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    scheduledDate: Date;
    completedDate?: string;
    inspectorName?: string;
  }>> {
    try {
      const { supabase } = await import('../lib/supabase');
      const { MAINTENANCE_CALENDAR } = await import('../types/maintenance');

      // 1. Obtener todos los centros de la BD
      const centers = await this.getCenters();

      // 2. Calcular trimestre actual
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); // 0-11
      const currentQuarter = Math.floor(currentMonth / 3) + 1; // 1-4

      // Meses del trimestre (0-indexed)
      const quarterStartMonth = (currentQuarter - 1) * 3;
      const quarterEndMonth = quarterStartMonth + 2;

      // Fecha límite: Intentar obtener de localStorage o usar default (15 del último mes)
      let deadlineDate = new Date(currentYear, quarterEndMonth, 15);
      const storedDeadline = localStorage.getItem(`maintenance_deadline_Q${currentQuarter}_${currentYear}`);
      if (storedDeadline) {
        deadlineDate = new Date(storedDeadline);
      }

      // Rango de fechas del trimestre para consulta
      const startDate = new Date(currentYear, quarterStartMonth, 1).toISOString();
      const endDate = new Date(currentYear, quarterEndMonth + 1, 0).toISOString(); // Último día del trimestre

      // 3. Obtener inspecciones de este trimestre
      const { data: inspections } = await supabase
        .from('maintenance_inspections')
        .select('center_id, inspection_date, inspector_name, status')
        .gte('inspection_date', startDate)
        .lte('inspection_date', endDate);

      return centers.map(center => {
        // Convertir ID a string para asegurar coincidencia
        const centerIdStr = center.id.toString();
        const inspection = inspections?.find(i => i.center_id === centerIdStr);

        let status: 'pending' | 'in_progress' | 'completed' | 'overdue' = 'pending';

        if (inspection) {
          if (inspection.status === 'completed' || inspection.status === 'reviewed') {
            status = 'completed';
          } else if (inspection.status === 'in_progress' || inspection.status === 'draft') {
            status = 'in_progress';
          }
        } else if (today > deadlineDate) {
          status = 'overdue';
        }

        return {
          centerId: centerIdStr,
          centerName: center.name,
          status,
          scheduledDate: deadlineDate,
          completedDate: inspection?.inspection_date,
          inspectorName: inspection?.inspector_name
        };
      });
    } catch (error) {
      console.error('❌ Error en getInspectionSchedule:', error);
      return [];
    }
  }

  // Guardar fecha límite personalizada para el trimestre actual
  setQuarterlyDeadline(date: Date): void {
    const today = new Date();
    const currentQuarter = Math.floor(today.getMonth() / 3) + 1;
    const currentYear = today.getFullYear();
    localStorage.setItem(`maintenance_deadline_Q${currentQuarter}_${currentYear}`, date.toISOString());
  }
  // =====================================================
  // HISTORIAL DE INSPECCIONES
  // =====================================================
  async getCenterInspectionHistory(centerId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { supabase } = await import('../lib/supabase');

      let query = supabase
        .from('maintenance_inspections')
        .select('*')
        .order('inspection_date', { ascending: false });

      if (centerId) {
        query = query.eq('center_id', centerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting history:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // =====================================================
  // ESTADÍSTICAS GLOBALES
  // =====================================================
  async getGlobalMaintenanceStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { supabase } = await import('../lib/supabase');

      // Obtener todas las inspecciones de los últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: inspections, error } = await supabase
        .from('maintenance_inspections')
        .select('inspection_date, overall_score, center_name')
        .gte('inspection_date', sixMonthsAgo.toISOString())
        .order('inspection_date', { ascending: true });

      if (error) throw error;

      // Agrupar por mes para la gráfica
      const statsByMonth: any = {};
      inspections?.forEach(insp => {
        const month = insp.inspection_date.substring(0, 7); // YYYY-MM
        if (!statsByMonth[month]) {
          statsByMonth[month] = { count: 0, totalScore: 0, month };
        }
        statsByMonth[month].count++;
        statsByMonth[month].totalScore += insp.overall_score;
      });

      const chartData = Object.values(statsByMonth).map((stat: any) => ({
        month: stat.month,
        averageScore: Math.round(stat.totalScore / stat.count),
        count: stat.count
      }));

      return { success: true, data: chartData };
    } catch (error) {
      console.error('Error getting global stats:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // =====================================================
  // GESTIÓN DE TICKETS
  // =====================================================
  async createTicketsFromInspection(inspectionId: string): Promise<void> {
    try {
      const { supabase } = await import('../lib/supabase');

      // 1. Obtener items "mal" o "regular"
      const { data: items } = await supabase
        .from('maintenance_inspection_items')
        .select('*')
        .eq('inspection_id', inspectionId)
        .in('status', ['mal', 'regular']);

      if (!items || items.length === 0) return;

      // 2. Obtener center_id de la inspección
      const { data: inspection } = await supabase
        .from('maintenance_inspections')
        .select('center_id')
        .eq('id', inspectionId)
        .single();

      if (!inspection) return;

      // 3. Crear tickets
      const tickets = items.map(item => ({
        inspection_item_id: item.id,
        center_id: inspection.center_id, // Usar BIGINT del centro
        title: `Incidencia: ${item.concept_name}`,
        description: `${item.zone_name}: ${item.observations || 'Sin observaciones'}`,
        status: 'open',
        priority: item.status === 'mal' ? 'high' : 'medium',
        created_at: new Date().toISOString()
      }));

      await supabase.from('maintenance_tickets').insert(tickets);

    } catch (error) {
      console.error('Error creating tickets:', error);
    }
  }

  async getTickets(filters?: any): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { supabase } = await import('../lib/supabase');

      // 1. Query maintenance_tickets table (direct tickets)
      let ticketsQuery = supabase.from('maintenance_tickets').select('*, centers(name)');
      if (filters?.status) ticketsQuery = ticketsQuery.eq('status', filters.status);
      if (filters?.priority) ticketsQuery = ticketsQuery.eq('priority', filters.priority);

      const { data: maintenanceTickets, error: ticketsError } = await ticketsQuery.order('created_at', { ascending: false });

      // 2. Query checklist_incidents table for maintenance-related incidents
      let incidentsQuery = supabase
        .from('checklist_incidents')
        .select('*, centers(name)')
        .or('incident_type.eq.maintenance,department.eq.Mantenimiento');

      // Map status filter from tickets format to incidents format
      if (filters?.status) {
        const statusMap: Record<string, string> = {
          'open': 'abierta',
          'in_progress': 'en_progreso',
          'resolved': 'resuelta'
        };
        const incidentStatus = statusMap[filters.status] || filters.status;
        incidentsQuery = incidentsQuery.eq('status', incidentStatus);
      }
      if (filters?.priority) {
        incidentsQuery = incidentsQuery.eq('priority', filters.priority);
      }

      const { data: checklistIncidents, error: incidentsError } = await incidentsQuery.order('created_at', { ascending: false });

      // 3. Query maintenance_inspection_items (quarterly inspection issues) - THIS IS WHERE THE 8 ITEMS COME FROM
      let inspectionItemsQuery = supabase
        .from('maintenance_inspection_items')
        .select(`
          *,
          maintenance_inspections (
            center_id,
            center_name
          )
        `)
        .neq('status', 'bien'); // Only items that need attention

      // Map status filter for inspection items
      if (filters?.status) {
        if (filters.status === 'open') {
          inspectionItemsQuery = inspectionItemsQuery.eq('task_status', 'pendiente');
        } else if (filters.status === 'in_progress') {
          inspectionItemsQuery = inspectionItemsQuery.eq('task_status', 'en_progreso');
        } else if (filters.status === 'resolved') {
          inspectionItemsQuery = inspectionItemsQuery.eq('task_status', 'completada');
        }
      } else {
        // By default, only show non-completed items
        inspectionItemsQuery = inspectionItemsQuery.neq('task_status', 'completada');
      }

      const { data: inspectionItems, error: inspectionError } = await inspectionItemsQuery.order('created_at', { ascending: false });

      // 4. Normalize checklist incidents to ticket format
      const normalizedIncidents = (checklistIncidents || []).map(incident => ({
        id: incident.id,
        title: incident.title || 'Incidencia de Checklist',
        description: incident.description,
        status: incident.status === 'abierta' ? 'open' :
          incident.status === 'en_progreso' ? 'in_progress' :
            incident.status === 'resuelta' ? 'resolved' : 'open',
        priority: incident.priority === 'critica' ? 'high' :
          incident.priority === 'alta' ? 'high' :
            incident.priority === 'media' ? 'medium' : 'low',
        created_at: incident.created_at,
        center_id: incident.center_id,
        centers: incident.centers,
        source: 'checklist'
      }));

      // 5. Normalize inspection items to ticket format
      const normalizedInspectionItems = (inspectionItems || []).map(item => ({
        id: item.id,
        title: `${item.zone_name} - ${item.concept_name}`,
        description: item.observations || item.task_to_perform || 'Requiere atención',
        status: item.task_status === 'pendiente' ? 'open' :
          item.task_status === 'en_progreso' ? 'in_progress' :
            item.task_status === 'completada' ? 'resolved' : 'open',
        priority: item.status === 'mal' ? 'high' : 'medium', // 'mal' = critical
        created_at: item.created_at,
        center_id: item.maintenance_inspections?.center_id,
        centers: { name: item.maintenance_inspections?.center_name || 'Centro' },
        source: 'inspection'
      }));

      // 6. Combine all sources
      const allTickets = [
        ...(maintenanceTickets || []).map(t => ({ ...t, source: 'maintenance' })),
        ...normalizedIncidents,
        ...normalizedInspectionItems
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log(`📋 Loaded: ${maintenanceTickets?.length || 0} maintenance_tickets + ${checklistIncidents?.length || 0} checklist_incidents + ${inspectionItems?.length || 0} inspection_items = ${allTickets.length} total`);

      return { success: true, data: allTickets };
    } catch (error) {
      console.error('❌ Error en getTickets:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateTicketStatus(ticketId: string, status: string, notes?: string): Promise<{ success: boolean }> {
    try {
      const { supabase } = await import('../lib/supabase');
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === 'resolved') updates.resolved_at = new Date().toISOString();
      if (notes) updates.resolution_notes = notes;

      const { error } = await supabase
        .from('maintenance_tickets')
        .update(updates)
        .eq('id', ticketId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }


  // =====================================================
  async clearAllData(): Promise<{ success: boolean; error?: string }> {
    try {
      const { supabase } = await import('../lib/supabase');
      console.log('🧹 Iniciando limpieza de datos de mantenimiento...');

      // 1. Eliminar alertas
      const { error: alertsError } = await supabase
        .from('maintenance_alerts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (alertsError) throw alertsError;

      // 2. Eliminar items
      const { error: itemsError } = await supabase
        .from('maintenance_inspection_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (itemsError) throw itemsError;

      // 3. Eliminar inspecciones
      const { error: inspectionsError } = await supabase
        .from('maintenance_inspections')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (inspectionsError) throw inspectionsError;

      return { success: true };
    } catch (error) {
      console.error('❌ Error en clearAllData:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }
}

// Exportar instancia singleton
export const maintenanceService = new MaintenanceService();
export default maintenanceService;
