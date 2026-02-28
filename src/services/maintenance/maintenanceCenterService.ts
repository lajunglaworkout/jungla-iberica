// src/services/maintenance/maintenanceCenterService.ts
// Centros, calendario de inspecciones, reparaciones frecuentes y sin gestionar

export async function getCenters(): Promise<Array<{ id: string; name: string }>> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const { data, error } = await supabase.from('centers').select('id, name').order('name');
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function getCenterComparison(): Promise<Array<{
  centerId: string;
  centerName: string;
  healthScore: number;
  pendingTickets: number;
  lastInspectionDate: string | null;
}>> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const centers = await getCenters();

    const { data: incidents } = await supabase
      .from('checklist_incidents').select('center_id, center_name, status')
      .in('status', ['abierta', 'en_progreso']);

    const incidentCountByName = new Map<string, number>();
    incidents?.forEach(inc => {
      if (inc.center_name) incidentCountByName.set(inc.center_name, (incidentCountByName.get(inc.center_name) || 0) + 1);
    });

    const { data: inspections } = await supabase
      .from('maintenance_inspections').select('center_id, center_name, overall_score, inspection_date')
      .order('inspection_date', { ascending: false });

    const lastInspectionByName = new Map<string, { score: number; date: string }>();
    inspections?.forEach(insp => {
      if (insp.center_name && !lastInspectionByName.has(insp.center_name)) {
        lastInspectionByName.set(insp.center_name, { score: insp.overall_score, date: insp.inspection_date });
      }
    });

    return centers.map(c => {
      const lastInsp = lastInspectionByName.get(c.name);
      let ticketCount = incidentCountByName.get(c.name) || 0;
      if (ticketCount === 0) {
        for (const [incName, count] of incidentCountByName.entries()) {
          const nc = c.name.toLowerCase().replace(/\s+/g, '');
          const ni = incName.toLowerCase().replace(/\s+/g, '');
          if (ni.includes(nc) || nc.includes(ni)) ticketCount += count;
        }
      }
      return { centerId: c.id.toString(), centerName: c.name, healthScore: lastInsp?.score || 0, pendingTickets: ticketCount, lastInspectionDate: lastInsp?.date || null };
    });
  } catch {
    return [];
  }
}

export async function getInspectionSchedule(): Promise<Array<{
  centerId: string;
  centerName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  scheduledDate: Date;
  completedDate?: string;
  inspectorName?: string;
}>> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const { MAINTENANCE_CALENDAR } = await import('../../types/maintenance');
    void MAINTENANCE_CALENDAR; // imported for side-effects / potential future use

    const centers = await getCenters();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    const quarterStartMonth = (currentQuarter - 1) * 3;
    const quarterEndMonth = quarterStartMonth + 2;

    let deadlineDate = new Date(currentYear, quarterEndMonth, 15);
    const storedDeadline = localStorage.getItem(`maintenance_deadline_Q${currentQuarter}_${currentYear}`);
    if (storedDeadline) deadlineDate = new Date(storedDeadline);

    const startDate = new Date(currentYear, quarterStartMonth, 1).toISOString();
    const endDate = new Date(currentYear, quarterEndMonth + 1, 0).toISOString();

    const { data: inspections } = await supabase
      .from('maintenance_inspections').select('center_id, inspection_date, inspector_name, status')
      .gte('inspection_date', startDate).lte('inspection_date', endDate);

    return centers.map(center => {
      const centerIdStr = center.id.toString();
      const inspection = inspections?.find(i => i.center_id === centerIdStr);
      let status: 'pending' | 'in_progress' | 'completed' | 'overdue' = 'pending';
      if (inspection) {
        status = (inspection.status === 'completed' || inspection.status === 'reviewed') ? 'completed'
          : (inspection.status === 'in_progress' || inspection.status === 'draft') ? 'in_progress' : 'pending';
      } else if (today > deadlineDate) {
        status = 'overdue';
      }
      return { centerId: centerIdStr, centerName: center.name, status, scheduledDate: deadlineDate, completedDate: inspection?.inspection_date, inspectorName: inspection?.inspector_name };
    });
  } catch {
    return [];
  }
}

export function setQuarterlyDeadline(date: Date): void {
  const today = new Date();
  const currentQuarter = Math.floor(today.getMonth() / 3) + 1;
  localStorage.setItem(`maintenance_deadline_Q${currentQuarter}_${today.getFullYear()}`, date.toISOString());
}

export async function getFrequentRepairs(): Promise<Array<{ conceptName: string; count: number; trend: 'up' | 'down' | 'stable' }>> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const { data: items } = await supabase
      .from('maintenance_inspection_items').select('concept_name, created_at')
      .neq('status', 'bien').gte('created_at', threeMonthsAgo.toISOString());

    if (!items || items.length === 0) return [];
    const counts: Record<string, number> = {};
    items.forEach(item => { counts[item.concept_name] = (counts[item.concept_name] || 0) + 1; });

    return Object.entries(counts)
      .map(([name, count]) => ({ conceptName: name, count, trend: 'stable' as const }))
      .sort((a, b) => b.count - a.count).slice(0, 5);
  } catch {
    return [];
  }
}

export async function getUnmanagedRepairs(): Promise<Array<{ id: string; centerName: string; conceptName: string; daysOpen: number; status: string }>> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: items } = await supabase
      .from('maintenance_inspection_items')
      .select(`id, concept_name, created_at, status, maintenance_inspections (center_name)`)
      .neq('task_status', 'completada').neq('status', 'bien')
      .lte('created_at', sevenDaysAgo.toISOString()).order('created_at', { ascending: true }).limit(10);

    if (!items) return [];

    return items.map((item: { id: string; concept_name: string; created_at: string; status: string; maintenance_inspections?: { center_name?: string } | null }) => ({
      id: item.id,
      centerName: item.maintenance_inspections?.center_name || 'Desconocido',
      conceptName: item.concept_name,
      daysOpen: Math.ceil(Math.abs(new Date().getTime() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      status: item.status
    }));
  } catch {
    return [];
  }
}

export async function getZonesAndConcepts() {
  try {
    const { supabase } = await import('../../lib/supabase');
    const [zonesResult, conceptsResult] = await Promise.all([
      supabase.from('maintenance_zones').select('*').order('name'),
      supabase.from('maintenance_concepts').select('*').order('zone_id, name')
    ]);
    return { zones: zonesResult.data || [], concepts: conceptsResult.data || [] };
  } catch {
    const { MAINTENANCE_ZONES, MAINTENANCE_CONCEPTS } = await import('../../types/maintenance');
    return { zones: MAINTENANCE_ZONES, concepts: MAINTENANCE_CONCEPTS };
  }
}
