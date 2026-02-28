// src/services/maintenance/maintenanceTicketService.ts
// Gestión de tickets: obtener, crear desde inspección, actualizar estado

export async function createTicketsFromInspection(inspectionId: string): Promise<void> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const { data: items } = await supabase.from('maintenance_inspection_items').select('*').eq('inspection_id', inspectionId).in('status', ['mal', 'regular']);
    if (!items || items.length === 0) return;

    const { data: inspection } = await supabase.from('maintenance_inspections').select('center_id').eq('id', inspectionId).single();
    if (!inspection) return;

    const tickets = items.map(item => ({
      inspection_item_id: item.id,
      center_id: inspection.center_id,
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

export async function getTickets(filters?: { status?: string; priority?: string }): Promise<{ success: boolean; data?: Record<string, unknown>[]; error?: string }> {
  try {
    const { supabase } = await import('../../lib/supabase');

    // 1. maintenance_tickets
    let ticketsQuery = supabase.from('maintenance_tickets').select('*, centers(name)');
    if (filters?.status) ticketsQuery = ticketsQuery.eq('status', filters.status);
    if (filters?.priority) ticketsQuery = ticketsQuery.eq('priority', filters.priority);
    const { data: maintenanceTickets } = await ticketsQuery.order('created_at', { ascending: false });

    // 2. checklist_incidents
    let incidentsQuery = supabase.from('checklist_incidents').select('*').or('incident_type.eq.maintenance,department.eq.Mantenimiento');
    if (filters?.status) {
      const statusMap: Record<string, string> = { 'open': 'abierta', 'in_progress': 'en_proceso', 'resolved': 'resuelta' };
      incidentsQuery = incidentsQuery.eq('status', statusMap[filters.status] || filters.status);
    }
    if (filters?.priority) incidentsQuery = incidentsQuery.eq('priority', filters.priority);
    const { data: checklistIncidents } = await incidentsQuery.order('created_at', { ascending: false });

    // 3. maintenance_inspection_items
    let inspectionItemsQuery = supabase
      .from('maintenance_inspection_items')
      .select(`*, maintenance_inspections (center_id, center_name)`)
      .neq('status', 'bien');

    if (filters?.status) {
      if (filters.status === 'open') inspectionItemsQuery = inspectionItemsQuery.eq('task_status', 'pendiente');
      else if (filters.status === 'in_progress') inspectionItemsQuery = inspectionItemsQuery.eq('task_status', 'en_progreso');
      else if (filters.status === 'resolved') inspectionItemsQuery = inspectionItemsQuery.eq('task_status', 'completada');
      else inspectionItemsQuery = inspectionItemsQuery.neq('task_status', 'completada');
    } else {
      inspectionItemsQuery = inspectionItemsQuery.neq('task_status', 'completada');
    }
    const { data: inspectionItems } = await inspectionItemsQuery.order('created_at', { ascending: false });

    const normalizedIncidents = (checklistIncidents || []).map(incident => ({
      id: incident.id,
      title: incident.title || 'Incidencia de Checklist',
      description: incident.description,
      status: incident.status === 'abierta' ? 'open' : (incident.status === 'en_proceso' || incident.status === 'en_progreso') ? 'in_progress' : incident.status === 'resuelta' ? 'resolved' : 'open',
      priority: incident.priority === 'critica' || incident.priority === 'alta' ? 'high' : incident.priority === 'media' ? 'medium' : 'low',
      created_at: incident.created_at,
      center_id: incident.center_id,
      centers: incident.centers || { name: incident.center_name },
      center_name: incident.center_name,
      source: 'checklist',
      reporter_name: incident.reporter_name, reporter_id: incident.reporter_id,
      incident_type: incident.incident_type, department: incident.department,
      responsible: incident.responsible, has_images: incident.has_images,
      image_urls: incident.image_urls || [], inventory_item: incident.inventory_item,
      inventory_quantity: incident.inventory_quantity, resolution_notes: incident.resolution_notes,
      resolved_by: incident.resolved_by, resolved_at: incident.resolved_at
    }));

    const normalizedInspectionItems = (inspectionItems || []).map(item => ({
      id: item.id,
      title: `${item.zone_name} - ${item.concept_name}`,
      description: item.observations || item.task_to_perform || 'Requiere atención',
      status: item.task_status === 'pendiente' ? 'open' : item.task_status === 'en_progreso' ? 'in_progress' : item.task_status === 'completada' ? 'resolved' : 'open',
      priority: item.status === 'mal' ? 'high' : 'medium',
      created_at: item.created_at,
      center_id: item.maintenance_inspections?.center_id,
      centers: { name: item.maintenance_inspections?.center_name || 'Centro' },
      source: 'inspection',
      zone_name: item.zone_name, concept_name: item.concept_name,
      observations: item.observations, task_to_perform: item.task_to_perform,
      completed_date: item.completed_date
    }));

    const allTickets = [
      ...(maintenanceTickets || []).map(t => ({ ...t, source: 'maintenance' })),
      ...normalizedIncidents,
      ...normalizedInspectionItems
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { success: true, data: allTickets };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateTicketStatus(ticketId: string, status: string, notes?: string): Promise<{ success: boolean }> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();
    if (notes) updates.resolution_notes = notes;
    const { error } = await supabase.from('maintenance_tickets').update(updates).eq('id', ticketId);
    if (error) throw error;
    return { success: true };
  } catch {
    return { success: false };
  }
}
