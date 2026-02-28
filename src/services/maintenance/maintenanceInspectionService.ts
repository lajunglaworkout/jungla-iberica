// src/services/maintenance/maintenanceInspectionService.ts
// CRUD de inspecciones + helpers privados (alertas, checklist, notificaciones)

import type {
  MaintenanceInspection,
  MaintenanceInspectionItem,
  MaintenanceAlert,
} from '../../types/maintenance';
import { MAINTENANCE_CALENDAR } from '../../types/maintenance';

export interface CreateInspectionData {
  inspection: Omit<MaintenanceInspection, 'id'>;
  items: MaintenanceInspectionItem[];
}

export interface InspectionResponse {
  success: boolean;
  data?: MaintenanceInspection;
  error?: string;
}

export interface InspectionListResponse {
  success: boolean;
  data?: MaintenanceInspection[];
  error?: string;
}

// ─── Private helpers ────────────────────────────────────────────────────────

async function integrateWithChecklist(inspection: MaintenanceInspection, items: MaintenanceInspectionItem[]): Promise<void> {
  try {
    const criticalItems = items.filter(item => item.is_critical_for_checklist);
    if (criticalItems.length === 0) return;
    const { supabase } = await import('../../lib/supabase');
    const checklistItems = criticalItems.map(item => ({
      center_id: inspection.center_id,
      category: 'mantenimiento',
      subcategory: item.zone_name.toLowerCase(),
      description: `MANTENIMIENTO CRÍTICO: ${item.concept_name}`,
      details: `${item.observations}. Tarea: ${item.task_to_perform}`,
      priority: 'alta',
      requires_photo: true,
      maintenance_item_id: item.id,
      created_by: inspection.inspector_email,
      status: 'pendiente',
      created_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('checklist_items').insert(checklistItems);
    if (error) console.error('Error integrando con check-list:', error);
    else console.log(`${checklistItems.length} items críticos añadidos al check-list diario`);
  } catch (error) {
    console.error('Error en integrateWithChecklist:', error);
  }
}

async function createCriticalAlerts(inspection: MaintenanceInspection, items: MaintenanceInspectionItem[]): Promise<void> {
  try {
    const criticalItems = items.filter(item => item.status === 'mal');
    if (criticalItems.length === 0) return;
    const { supabase } = await import('../../lib/supabase');
    const alerts: Omit<MaintenanceAlert, 'id'>[] = criticalItems.map(item => ({
      type: 'critical_issue',
      center_id: inspection.center_id,
      center_name: inspection.center_name,
      title: `Estado crítico: ${item.concept_name}`,
      message: `${item.zone_name} - ${item.concept_name}: ${item.observations}. Tarea: ${item.task_to_perform}`,
      severity: 'critical',
      related_id: inspection.id,
      acknowledged: false,
      created_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('maintenance_alerts').insert(alerts);
    if (error) console.error('Error creando alertas:', error);
    else console.log(`${alerts.length} alertas críticas creadas`);
  } catch (error) {
    console.error('Error en createCriticalAlerts:', error);
  }
}

async function notifyBeniForCriticalItems(inspection: MaintenanceInspection, items: MaintenanceInspectionItem[]): Promise<void> {
  try {
    const criticalItems = items.filter(item => item.status === 'mal');
    if (criticalItems.length === 0) return;
    const emailContent = {
      to: MAINTENANCE_CALENDAR.beni_email,
      subject: `MANTENIMIENTO CRÍTICO - ${inspection.center_name}`,
      body: `Se ha detectado ${criticalItems.length} problema(s) crítico(s) en ${inspection.center_name}.\nInspector: ${inspection.inspector_name}\nFecha: ${new Date(inspection.inspection_date).toLocaleDateString('es-ES')}\nPuntuación: ${inspection.overall_score}/100`
    };
    console.log('Notificación enviada a Beni:', emailContent);
    // await emailService.send(emailContent);
  } catch (error) {
    console.error('Error notificando a Beni:', error);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function startInspection(centerId: string, inspectorName: string): Promise<{ success: boolean; inspectionId?: string; error?: string }> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const today = new Date();
    const currentMonthStr = today.toISOString().substring(0, 7);

    const { data: existing } = await supabase
      .from('maintenance_inspections')
      .select('id, status')
      .eq('center_id', centerId)
      .eq('inspection_month', currentMonthStr)
      .single();

    if (existing) {
      if (existing.status === 'completed' || existing.status === 'reviewed') {
        return { success: true, inspectionId: existing.id };
      }
      const { count } = await supabase
        .from('maintenance_inspection_items')
        .select('*', { count: 'exact', head: true })
        .eq('inspection_id', existing.id);

      if (count === 0) {
        const { MAINTENANCE_ZONES, MAINTENANCE_CONCEPTS } = await import('../../types/maintenance');
        const initialItems = [];
        for (const zone of MAINTENANCE_ZONES) {
          for (const concept of MAINTENANCE_CONCEPTS.filter(c => c.zone_id === zone.id)) {
            initialItems.push({ inspection_id: existing.id, zone_id: zone.id, zone_name: zone.name, concept_id: concept.id, concept_name: concept.name, status: 'bien', observations: '', task_to_perform: '', task_priority: 'baja', photos_deterioro: [], photos_reparacion: [], photos_required: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
          }
        }
        await supabase.from('maintenance_inspection_items').insert(initialItems);
      }

      const { error: updateError } = await supabase
        .from('maintenance_inspections')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (updateError) throw updateError;
      return { success: true, inspectionId: existing.id };
    }

    const newInspection: Partial<MaintenanceInspection> = {
      id: crypto.randomUUID(), center_id: centerId, center_name: '',
      inspector_name: inspectorName, inspection_date: today.toISOString(),
      inspection_month: currentMonthStr, inspection_year: today.getFullYear(),
      status: 'in_progress', total_items: 0, items_ok: 0, items_regular: 0,
      items_bad: 0, overall_score: 0, notes: '',
      created_at: today.toISOString(), updated_at: today.toISOString()
    };

    const { data: centerData } = await supabase.from('centers').select('name').eq('id', centerId).single();
    if (centerData) newInspection.center_name = centerData.name;

    const { error: insertError } = await supabase.from('maintenance_inspections').insert(newInspection);
    if (insertError) throw insertError;

    const { MAINTENANCE_ZONES, MAINTENANCE_CONCEPTS } = await import('../../types/maintenance');
    const initialItems = [];
    for (const zone of MAINTENANCE_ZONES) {
      for (const concept of MAINTENANCE_CONCEPTS.filter(c => c.zone_id === zone.id)) {
        initialItems.push({ inspection_id: newInspection.id, zone_id: zone.id, zone_name: zone.name, concept_id: concept.id, concept_name: concept.name, status: 'bien', observations: '', task_to_perform: '', task_priority: 'baja', photos_deterioro: [], photos_reparacion: [], photos_required: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      }
    }
    await supabase.from('maintenance_inspection_items').insert(initialItems);
    return { success: true, inspectionId: newInspection.id };
  } catch (error) {
    console.error('Error en startInspection:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function updateInspectionItemProgress(itemId: string, updates: Partial<MaintenanceInspectionItem>): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const { error } = await supabase.from('maintenance_inspection_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', itemId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function completeInspection(inspectionId: string, summaryData: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const { data: inspection, error: updateError } = await supabase
      .from('maintenance_inspections')
      .update({ ...summaryData, status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', inspectionId).select().single();
    if (updateError) throw updateError;

    const { data: items } = await supabase.from('maintenance_inspection_items').select('*').eq('inspection_id', inspectionId);
    if (items) {
      await createCriticalAlerts(inspection, items);
      await notifyBeniForCriticalItems(inspection, items);
      await integrateWithChecklist(inspection, items);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function createInspection(inspectionData: CreateInspectionData): Promise<InspectionResponse> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const { data: inspection, error: inspectionError } = await supabase
      .from('maintenance_inspections').insert([inspectionData.inspection]).select().single();
    if (inspectionError) return { success: false, error: inspectionError.message };

    const itemsWithId = inspectionData.items.map(item => ({ ...item, inspection_id: inspection.id, id: undefined }));
    const { error: itemsError } = await supabase.from('maintenance_inspection_items').insert(itemsWithId);
    if (itemsError) {
      await supabase.from('maintenance_inspections').delete().eq('id', inspection.id);
      return { success: false, error: itemsError.message };
    }

    await createCriticalAlerts(inspection, inspectionData.items);
    await notifyBeniForCriticalItems(inspection, inspectionData.items);
    await integrateWithChecklist(inspection, inspectionData.items);
    return { success: true, data: inspection };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function getInspectionsByCenter(centerId: string, limit = 10): Promise<InspectionListResponse> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const { data, error } = await supabase.from('maintenance_inspections').select('*').eq('center_id', centerId).order('inspection_date', { ascending: false }).limit(limit);
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function getInspectionItems(inspectionId: string): Promise<{ success: boolean; data?: MaintenanceInspectionItem[]; error?: string }> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const { data, error } = await supabase.from('maintenance_inspection_items').select('*').eq('inspection_id', inspectionId).order('zone_name', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function needsInspection(centerId: string): Promise<{ needs: boolean; lastInspection?: MaintenanceInspection }> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const currentMonth = new Date().toISOString().substring(0, 7);
    const { data: lastInspection, error } = await supabase.from('maintenance_inspections').select('*').eq('center_id', centerId).eq('inspection_month', currentMonth).single();
    if (error && error.code !== 'PGRST116') return { needs: true };
    return { needs: !lastInspection, lastInspection: lastInspection || undefined };
  } catch {
    return { needs: true };
  }
}

export async function getAllInspections(filters?: { centerId?: string; startDate?: string; endDate?: string }, limit = 50): Promise<InspectionListResponse> {
  try {
    const { supabase } = await import('../../lib/supabase');
    let query = supabase.from('maintenance_inspections').select('*').order('inspection_date', { ascending: false }).limit(limit);
    if (filters?.centerId) query = query.eq('center_id', filters.centerId);
    if (filters?.startDate) query = query.gte('inspection_date', filters.startDate);
    if (filters?.endDate) query = query.lte('inspection_date', filters.endDate);
    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function getCenterInspectionHistory(centerId: string): Promise<{ success: boolean; data?: MaintenanceInspection[]; error?: string }> {
  try {
    const { supabase } = await import('../../lib/supabase');
    let query = supabase.from('maintenance_inspections').select('*').order('inspection_date', { ascending: false });
    if (centerId) query = query.eq('center_id', centerId);
    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function uploadMaintenancePhoto(file: File, itemId: string, type: 'deterioro' | 'reparacion'): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const fileExt = file.name.split('.').pop();
    const filePath = `maintenance/${itemId}_${type}_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('maintenance-photos').upload(filePath, file);
    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage.from('maintenance-photos').getPublicUrl(filePath);
    const photoUrl = urlData.publicUrl;

    const { data: currentItem, error: fetchError } = await supabase.from('maintenance_inspection_items').select('photos_deterioro, photos_reparacion').eq('id', itemId).single();
    if (fetchError) return { success: false, error: fetchError.message };

    const updatedPhotos = type === 'deterioro' ? [...(currentItem.photos_deterioro || []), photoUrl] : [...(currentItem.photos_reparacion || []), photoUrl];
    const updateField = type === 'deterioro' ? 'photos_deterioro' : 'photos_reparacion';
    const updateData: Record<string, unknown> = { [updateField]: updatedPhotos, updated_at: new Date().toISOString() };
    if (type === 'reparacion') updateData.can_close_task = true;

    const { error: updateError } = await supabase.from('maintenance_inspection_items').update(updateData).eq('id', itemId);
    if (updateError) return { success: false, error: updateError.message };
    return { success: true, url: photoUrl };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function updateTaskStatus(itemId: string, status: 'pendiente' | 'en_progreso' | 'completada', repairPhotos?: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const updateData: Record<string, unknown> = { task_status: status, updated_at: new Date().toISOString() };
    if (status === 'completada') { updateData.completed_date = new Date().toISOString().split('T')[0]; updateData.can_close_task = true; }
    if (repairPhotos?.length) { updateData.photos_reparacion = repairPhotos; updateData.can_close_task = true; }
    const { error } = await supabase.from('maintenance_inspection_items').update(updateData).eq('id', itemId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function clearAllData(): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const dummyUUID = '00000000-0000-0000-0000-000000000000';
    for (const table of ['maintenance_alerts', 'maintenance_inspection_items', 'maintenance_inspections'] as const) {
      const { error } = await supabase.from(table).delete().neq('id', dummyUUID);
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
